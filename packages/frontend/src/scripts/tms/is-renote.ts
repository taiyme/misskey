/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';

type Note = Misskey.entities.Note;

type Renote =
	Note & {
		renoteId: NonNullable<Misskey.entities.Note['renoteId']>;
		renote: NonNullable<Misskey.entities.Note['renote']>;
	};

type Quote =
	Renote & ({
		text: NonNullable<Note['text']>;
	} | {
		cw: NonNullable<Note['cw']>;
	} | {
		replyId: NonNullable<Note['replyId']>;
		reply: NonNullable<Note['reply']>;
	} | {
		poll: NonNullable<Note['poll']>;
	} | {
		fileIds: NonNullable<Note['fileIds']>;
		files: NonNullable<Note['files']>;
	});

export const isRenote = (note: Note): note is Renote => {
	return note.renoteId != null;
};

export const isQuote = (note: Renote): note is Quote => {
	// NOTE: SYNC WITH misc/is-quote.ts (backend)
	return note.text != null ||
		note.cw != null ||
		note.replyId != null ||
		note.poll != null ||
		(note.fileIds?.length ?? 0) > 0;
};
