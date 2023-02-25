import * as misskey from 'misskey-js';
import { v4 as uuid } from 'uuid';
import * as os from '@/os';
import { $i } from '@/account';
import { stream } from '@/stream';
import { defaultStore } from '@/store';

type DriveFile = misskey.entities.DriveFile & { comment?: string | null };

type Note = misskey.entities.Note & { channelId?: string | null };

type Poll = {
	choices: string[];
	multiple: boolean;
	expiresAt?: number | null;
	expiredAfter?: number | null;
}

type PostData = {
	text?: string | null;
	cw?: string | null;
	localOnly?: boolean;
	visibility?: 'public' | 'home' | 'followers' | 'specified';
	visibleUserIds?: string[];
	fileIds?: string[];
	replyId?: string | null;
	renoteId?: string | null;
	channelId?: string | null;
	poll?: Poll | null;
}

async function uploadFile(_file: DriveFile): Promise<DriveFile> {
	return new Promise((res) => {
		const marker = uuid();

		const connection = stream.useChannel('main');
		connection.on('urlUploadFinished', urlResponse => {
			if (urlResponse.marker === marker) {
				res(urlResponse.file as DriveFile);
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
}

async function uploadFiles(_files: DriveFile[]): Promise<DriveFile[]> {
	return Promise.all(_files.map(_file => uploadFile(_file)));
}

async function makeParams(_note: Note): Promise<PostData> {
	const isRenote = (
		_note.renote != null &&
		_note.text == null &&
		_note.fileIds.length === 0 &&
		_note.poll == null
	);

	const note = isRenote ? (_note.renote as Note) : _note;
	const { text, cw, localOnly, visibility, files, replyId, renoteId, channelId } = note;

	const visibleUserIds = [...new Set(note.visibleUserIds || [])];
	if (visibility === 'specified' && !visibleUserIds.includes(note.userId)) {
		visibleUserIds.push(note.userId);
	}

	const _poll = note.poll;
	const poll: Poll | null = _poll ? ({} as Poll) : null;
	if (poll && _poll) {
		poll.choices = _poll.choices.map(choice => choice.text);
		poll.multiple = !!_poll.multiple;

		if (_poll.expiresAt) {
			poll.expiredAfter = new Date(_poll.expiresAt).getTime() - new Date(note.createdAt).getTime();
		}
	}

	const fileIds = $i?.id === note.userId ? note.fileIds : (await uploadFiles(files)).map(file => file.id);

	const params: PostData = { text, cw, localOnly, visibility, visibleUserIds, fileIds, replyId, renoteId, channelId, poll };

	return Object.fromEntries(Object.entries(params).filter(([,v]) => {
		if (v == null) return false;
		if (Array.isArray(v)) return !!v.length;
		return true;
	}));
}

function _nqadd(text: PostData['text']): PostData['text'] {
	if (!text) return '1';
	if (text.endsWith('</center>')) return `${text}\n1`;
	if (!/\-?\d+$/.test(text)) return `${text}1`;
	return text.replace(/\-?\d+$/, (n => (Number(n) + 1).toString(10)));
}

export async function pakuru(note: Note): Promise<void> {
	os.api('notes/create', await makeParams(note));
}

export async function numberquote(note: Note): Promise<void> {
	os.api('notes/create', await makeParams(note).then(params => {
		params.text = _nqadd(params.text);
		return params;
	}));
}
