/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import copyToClipboard from '@/scripts/copy-to-clipboard.js';

/**
 * Clipboardに文字列をコピーする
 */
export const copyText = async (text: unknown): Promise<boolean> => {
	if (typeof text !== 'string') return false;
	try {
		const result = await navigator.clipboard.writeText(text).then(() => true, () => false);
		if (result) return true;
		throw new Error();
	} catch {
		return copyToClipboard(text);
	}
};
