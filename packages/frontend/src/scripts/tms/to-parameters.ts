/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import * as mfm from 'mfm-js';
import { $i, getAccounts } from '@/account.js';
import { defaultStore } from '@/store.js';
import { deepClone } from '@/scripts/clone.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { getAppearNote } from '@/scripts/tms/is-pure-renote.js';

export type NoteEntity = Misskey.entities.Note;
export type NoteEntityOrId = NoteEntity | string;
export type NoteParameters = Misskey.Endpoints['notes/create']['req'];

type UserLike = {
	meId: string;
	token: string;
};

export const toParameters = async (noteEntityOrId: NoteEntityOrId, fromId?: string | null): Promise<{
	parameters: NoteParameters;
	me: UserLike;
}> => {
	const meId = fromId ?? $i?.id ?? null;
	if (meId == null) throw new Error('toParameters: meId is required.');

	const token = (await getAccounts()).find(({ id }) => id === meId)?.token ?? null;
	if (token == null) throw new Error('toParameters: token is required.');

	const me = { meId, token };

	const note = await toNoteEntity(noteEntityOrId, me);
	if (note == null) throw new Error('toParameters: No such note.');

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

	return { parameters, me };
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

	const filesPromise = files.map((file) => {
		return misskeyApi('drive/files/upload-from-url', {
			url: file.url,
			folderId: defaultStore.state.uploadFolder,
			isSensitive: file.isSensitive,
			comment: file.comment,
			force: true,
		}, token);
	});

	const uploadedFileIds = await Promise.all(filesPromise).then(f => f.map(({ id }) => id)).catch(() => undefined);

	return uploadedFileIds;
};

const makeVisibleUserIds = ({ visibility, visibleUserIds, userId }: NoteEntity, { meId }: UserLike): NoteParameters['visibleUserIds'] => {
	if (visibility !== 'specified') return undefined;
	const idList = new Set(visibleUserIds);
	idList.add(userId);
	idList.add(meId);
	if (idList.size === 0) return undefined;
	return Array.from(idList);
};

const makePoll = ({ poll, createdAt }: NoteEntity): NoteParameters['poll'] => {
	if (poll == null) return null;
	const choices = poll.choices.map(choice => choice.text);
	const multiple = poll.multiple;
	const expiresAt = null;
	const expiredAfter = (poll.expiresAt && Date.parse(poll.expiresAt) - Date.parse(createdAt)) || null;
	return { choices, multiple, expiresAt, expiredAfter };
};
