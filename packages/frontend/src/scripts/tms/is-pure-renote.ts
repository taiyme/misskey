/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';

type OverrideProperties<A, B> = Omit<A, keyof B> & B;

type PureRenote = OverrideProperties<Misskey.entities.Note, {
	text: null;
	poll?: null;
	fileIds?: [];
	renote: NonNullable<Misskey.entities.Note['renote']>;
	renoteId: NonNullable<Misskey.entities.Note['renoteId']>;
}>;

export const isPureRenote = (note: Misskey.entities.Note): note is PureRenote => {
	if (note.renote == null) return false;

	if (note.text != null) return false; // it's quoted with text
	if (note.cw != null) return false; // it's quoted with cw
	if (note.fileIds != null && note.fileIds.length !== 0) return false; // it's quoted with files
	if (note.poll != null) return false; // it's quoted with poll
	return true;
};

export const getAppearNote = (note: Misskey.entities.Note): Misskey.entities.Note => {
	return isPureRenote(note) ? note.renote : note;
};
