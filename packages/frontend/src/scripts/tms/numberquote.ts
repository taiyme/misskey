/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { NoteEntityOrId, NoteParameters, toParameters } from '@/scripts/tms/to-parameters.js';

export const numberquote = async (noteEntityOrId: NoteEntityOrId, fromId?: string | null): Promise<Misskey.Endpoints['notes/create']['res']> => {
	const { parameters, me } = await toParameters(noteEntityOrId, fromId);
	parameters.text = incrText(parameters.text);
	return misskeyApi('notes/create', parameters, me.token);
};

const extractNqTokens = (text: NoteParameters['text']): {
	readonly str: string;
	readonly num: string;
} => {
	if (text == null || text === '') {
		return { str: '', num: '' } as const;
	}
	if (text.endsWith('</center>')) {
		const str = `${text}\n`;
		return { str, num: '' } as const;
	}
	if (text.endsWith(':')) {
		const ZWSP = '\u200b';
		const str = `${text}${ZWSP}`;
		return { str, num: '' } as const;
	}
	const result = text.split(/(\-?\d+)$/);
	const str = result.at(0) ?? '';
	const num = result.at(1) ?? '';
	return { str, num } as const;
};

const incrText = (text: NoteParameters['text']): NoteParameters['text'] => {
	const token = extractNqTokens(text);
	if (token.num === '') return `${token.str}2`;
	return `${token.str}${(BigInt(token.num) + 1n).toString(10)}`;
};

const decrText = (text: NoteParameters['text']): NoteParameters['text'] => {
	const token = extractNqTokens(text);
	if (token.num === '') return `${token.str}0`;
	return `${token.str}${(BigInt(token.num) - 1n).toString(10)}`;
};
