/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function getUrlWithLoginId(url: string, loginId: string) {
	const u = new URL(url, origin);
	u.searchParams.append('loginId', loginId);
	return u.toString();
}

export function getUrlWithoutLoginId(url: string) {
	const u = new URL(url);
	u.searchParams.delete('loginId');
	return u.toString();
}
