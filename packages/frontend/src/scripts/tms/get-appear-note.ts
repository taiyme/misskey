/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { isQuote, isRenote } from '@/scripts/tms/is-renote.js';

export const getAppearNote = (note: Misskey.entities.Note): Misskey.entities.Note => {
	if (isRenote(note) && !isQuote(note)) {
		return note.renote;
	}
	return note;
};
