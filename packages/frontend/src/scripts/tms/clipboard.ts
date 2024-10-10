/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * クリップボードに文字列をコピーする
 * @param text コピーする文字列
 */
export const copyText = async (text: unknown): Promise<boolean> => {
	if (typeof text !== 'string') return false;
	try {
		return await navigator.clipboard.writeText(text).then(() => true);
	} catch {
		// fallback
		return (await import('@/scripts/copy-to-clipboard.js')).default(text);
	}
};
