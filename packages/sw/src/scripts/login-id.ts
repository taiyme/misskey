/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function getUrlWithLoginId(url: string, loginId: string): string {
	const u = new URL(url, origin);
	u.searchParams.set('loginId', loginId);
	return u.toString();
}
