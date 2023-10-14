/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type Http = `http://${string}`;
type Https = `https://${string}`;

export const checkHttp = (value: unknown): value is Http => {
	return typeof value === 'string' && value.startsWith('http://');
};

export const checkHttps = (value: unknown): value is Https => {
	return typeof value === 'string' && value.startsWith('https://');
};

export const checkHttpOrHttps = (value: unknown): value is Http | Https => {
	return typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'));
};
