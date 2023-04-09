import { DriveFile, Note as Note_ } from 'misskey-js/built/entities';
import * as mfm from 'mfm-js';
import { v4 as uuid } from 'uuid';
import * as os from '@/os';
import { $i } from '@/account';
import { stream } from '@/stream';
import { defaultStore } from '@/store';
import { deepClone } from '@/scripts/clone';
import { isPureRenote } from '@/scripts/tms/is-pure-renote';

type SomeRequired<T, K extends keyof T> = Omit<T, K> & Required<RequiredNotNull<Pick<T, K>>>;
type RequiredNotNull<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

type PostDataBase = Partial<{
	text: string | null;
	visibility: 'public' | 'home' | 'followers' | 'specified';
	visibleUserIds: string[];
	cw: string | null;
	localOnly: boolean;
	noExtractMentions: boolean;
	noExtractHashtags: boolean;
	noExtractEmojis: boolean;
	fileIds: string[];
	replyId: string | null;
	renoteId: string | null;
	channelId: string | null;
	poll: {
		choices: string[];
		multiple?: boolean;
		expiresAt?: number | null;
		expiredAfter?: number | null;
	} | null;
}>;

type PostData = (
	| SomeRequired<PostDataBase, 'text'>
	| SomeRequired<PostDataBase, 'fileIds'>
	| SomeRequired<PostDataBase, 'poll'>
	| SomeRequired<PostDataBase, 'renoteId'>
);

type Note = Note_ & { channelId?: string | null };

const uploadFile = async (_file: DriveFile): Promise<DriveFile> => {
	return new Promise((res) => {
		const marker = uuid();

		const connection = stream.useChannel('main');
		connection.on('urlUploadFinished', urlResponse => {
			if (urlResponse.marker === marker) {
				res(urlResponse.file);
				connection.dispose();
			}
		});

		os.api('drive/files/upload-from-url', {
			url: _file.url,
			folderId: defaultStore.state.uploadFolder,
			isSensitive: _file.isSensitive,
			comment: _file.comment,
			marker,
			force: true,
		});
	});
};

const uploadFiles = async (_files: DriveFile[]): Promise<DriveFile[]> => {
	return Promise.all(_files.map(_file => uploadFile(_file)));
};

const fixMentionsHost = (note: Note): Note => {
	if (note.user.host == null) return note;

	const _fix = (text: string, host: string): string => {
		const tokens = mfm.parse(text);
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

	const text = note.text && _fix(note.text, note.user.host);
	const cw = note.cw && _fix(note.cw, note.user.host);

	return { ...note, text, cw };
};

const makeVisibleUserIds = ({ visibility, visibleUserIds, userId }: Note): PostData['visibleUserIds'] => {
	const ids = new Set(visibleUserIds);
	if (visibility === 'specified') ids.add(userId);
	return Array.from(ids);
};

const makeFileIds = async ({ files, fileIds, userId }: Note): Promise<PostData['fileIds']> => {
	if ($i?.id === userId) return fileIds;
	return (await uploadFiles(files)).map(file => file.id);
};

const makePoll = ({ poll, createdAt }: Note): PostData['poll'] => {
	if (poll == null) return null;

	const choices = poll.choices.map(choice => choice.text);
	const multiple = poll.multiple;
	const expiredAfter = poll.expiresAt && Date.parse(poll.expiresAt) - Date.parse(createdAt) || null;

	return { choices, multiple, expiredAfter };
};

const makeParams = async (_note: Note): Promise<PostData> => {
	const note = fixMentionsHost(deepClone(isPureRenote(_note) ? _note.renote : _note));
	const { text, cw, localOnly, visibility, replyId, renoteId, channelId } = note;

	const visibleUserIds = makeVisibleUserIds(note);
	const fileIds = await makeFileIds(note);
	const poll = makePoll(note);

	const params: PostData = { text, cw, localOnly, visibility, visibleUserIds, fileIds, replyId, renoteId, channelId, poll };

	for (const k in params) {
		if (Object.prototype.hasOwnProperty.call(params, k)) {
			const v = params[k] as unknown;
			if (v == null) delete params[k];
			if (Array.isArray(v) && v.length === 0) delete params[k];
		}
	}

	return params;
};

const _nqadd = (text: PostData['text']): PostData['text'] => {
	if (!text) return '2';
	if (text.endsWith('</center>')) return `${text}\n2`;
	if (!/\-?\d+$/.test(text)) return `${text}2`;
	return text.replace(/\-?\d+$/, (n => (BigInt(n) + 1n).toString(10)));
};

export const pakuru = async (note: Note): Promise<{
	createdNote: Note;
}> => {
	return os.api('notes/create', await makeParams(note));
};

export const numberquote = async (note: Note): Promise<{
	createdNote: Note;
}> => {
	return os.api('notes/create', await makeParams(note).then(params => {
		const text = _nqadd(params.text);
		return { ...params, text };
	}));
};
