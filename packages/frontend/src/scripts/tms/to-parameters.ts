/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import * as mfm from 'mfm-js';
import { $i, getAccounts } from '@/account.js';
import { defaultStore } from '@/store.js';
import { unique } from '@/scripts/array.js';
import { deepClone } from '@/scripts/clone.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { getAppearNote } from '@/scripts/tms/is-pure-renote.js';

export class ParametersError extends Error {
	public readonly message: string;
	public readonly code: string;
	public readonly id: string;

	constructor(error: {
		readonly message: string;
		readonly code: string;
		readonly id: string;
	}) {
		super(error.message);
		this.message = error.message;
		this.code = error.code;
		this.id = error.id;
	}
}

export type NoteEntity = Misskey.entities.Note;
export type NoteEntityOrId = NoteEntity | string;
export type NoteParameters = Misskey.Endpoints['notes/create']['req'];

type UserLike = {
	readonly meId: string;
	readonly token: string;
};

export const toParameters = async (noteEntityOrId: NoteEntityOrId, fromId?: string | null): Promise<{
	readonly parameters: NoteParameters;
	readonly me: UserLike;
}> => {
	const meId = fromId ?? $i?.id ?? null;
	if (meId == null) {
		throw new ParametersError({
			message: '[toParameters]: meId is required. (kind: taiyme)',
			code: 'MEID_IS_REQUIRED',
			id: '6024ed6b-9ab0-4905-8cac-36f5c75aea59',
		});
	}

	const token = (await getAccounts()).find(({ id }) => id === meId)?.token ?? null;
	if (token == null) {
		throw new ParametersError({
			message: '[toParameters]: token is required. (kind: taiyme)',
			code: 'TOKEN_IS_REQUIRED',
			id: '34825d40-8c57-43b8-ac75-04a7bb9bd56d',
		});
	}

	const me = { meId, token } as const satisfies UserLike;

	const note = await toNoteEntity(noteEntityOrId, me);
	if (note == null) {
		throw new ParametersError({
			message: '[toParameters]: No such note. (kind: taiyme)',
			code: 'NO_SUCH_NOTE',
			id: 'c756e6b2-b56c-45b6-8978-7d178fb3862e',
		});
	}

	const text = makeText(note);
	const cw = makeCw(note);
	const fileIds = await makeFileIds(note, me);
	const visibleUserIds = makeVisibleUserIds(note, me);
	const poll = makePoll(note);
	const { visibility, localOnly, replyId, renoteId, channelId, reactionAcceptance } = note;

	const parameters: NoteParameters = { text, cw, fileIds, visibleUserIds, poll, visibility, localOnly, replyId, renoteId, channelId, reactionAcceptance };

	for (const k in parameters) {
		if (Object.prototype.hasOwnProperty.call(parameters, k)) {
			const v = parameters[k] as unknown;
			if (v == null) delete parameters[k];
			if (Array.isArray(v) && v.length === 0) delete parameters[k];
		}
	}

	return { parameters, me } as const;
};

const toNoteEntity = async (noteEntityOrId: NoteEntityOrId, { token }: UserLike): Promise<NoteEntity | null> => {
	if (typeof noteEntityOrId === 'string') {
		const fetchedNote = await misskeyApi('notes/show', { noteId: noteEntityOrId }, token).catch(() => null);
		if (fetchedNote == null) return null;
		const appearNote = getAppearNote(fetchedNote);
		return appearNote;
	}
	const appearNote = getAppearNote(noteEntityOrId);
	return deepClone(appearNote);
};

const adjustRemoteMentions = (str: string, host: string): string => {
	const tokens = mfm.parse(str);
	const mentionNode = (node: mfm.MfmNode): void => {
		if (node.type === 'mention') {
			if (node.props.host == null) {
				node.props.host = host;
				node.props.acct = `${node.props.acct}@${host}`;
			}
		}
		if (node.children) {
			for (const child of node.children) {
				mentionNode(child);
			}
		}
	};
	for (const node of tokens) {
		mentionNode(node);
	}
	return mfm.toString(tokens);
};

const makeText = ({ text, user: { host } }: NoteEntity): NoteParameters['text'] => {
	if (text == null || text === '') return text;
	if (host == null) return text;
	return adjustRemoteMentions(text, host);
};

const makeCw = ({ cw, user: { host } }: NoteEntity): NoteParameters['cw'] => {
	if (cw == null) return cw;
	if (cw === '') return '\u200b';
	if (host == null) return cw;
	return adjustRemoteMentions(cw, host);
};

const makeFileIds = async ({ files, fileIds, userId }: NoteEntity, { meId, token }: UserLike): Promise<NoteParameters['fileIds']> => {
	if (files == null || files.length === 0) return undefined;
	if (fileIds == null || fileIds.length === 0) return undefined;
	if (userId === meId) return fileIds;

	const folderId = defaultStore.state.uploadFolder;
	const promises = files.map((file) => {
		return misskeyApi('drive/files/upload-from-url', {
			url: file.url,
			isSensitive: file.isSensitive,
			comment: file.comment,
			folderId,
		}, token);
	});

	try {
		return await Promise.all(promises).then(x => x.map(({ id }) => id));
	} catch {
		throw new ParametersError({
			message: '[toParameters]: File upload failed. (kind: taiyme)',
			code: 'FILE_UPLOAD_FAILED',
			id: '1de1dd90-03c0-4bd0-8258-9a1aefb9cd94',
		});
	}
};

const makeVisibleUserIds = ({ visibility, visibleUserIds, userId }: NoteEntity, { meId }: UserLike): NoteParameters['visibleUserIds'] => {
	if (visibility !== 'specified') return undefined;
	const uniqueUserIds = unique([...visibleUserIds ?? [], userId, meId]);
	if (uniqueUserIds.length === 0) return undefined;
	return uniqueUserIds;
};

const makePoll = ({ poll, createdAt }: NoteEntity): NoteParameters['poll'] => {
	if (poll == null) return null;
	const choices = poll.choices.map(choice => choice.text);
	const multiple = poll.multiple;
	const expiresAt = null;
	let expiredAfter: number | null = null;
	if (poll.expiresAt) {
		expiredAfter = (Date.parse(poll.expiresAt) - Date.parse(createdAt)) || 1000 * 60;
	}
	return { choices, multiple, expiresAt, expiredAfter };
};
