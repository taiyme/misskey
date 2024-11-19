/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { url } from '@@/js/config.js';
import { numberFormat } from '@@/js/intl-const.js';

export const acct = (user: Misskey.Acct) => {
	return Misskey.acct.toString(user);
};

export const userName = (user: Misskey.entities.User) => {
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	return user.name || user.username;
};

export const userPage = (user: Misskey.Acct, path?: string) => {
	return `${url}/@${acct(user)}${path ? `/${path}` : ''}`;
};

export const notePage = (note: Misskey.entities.Note | string, path?: string) => {
	return `${url}/notes/${typeof note === 'string' ? note : note.id}${path ? `/${path}` : ''}`;
};

export const number = (n: number | bigint | Intl.StringNumericLiteral | null | undefined) => {
	return n == null ? 'N/A' : numberFormat.format(n);
};
