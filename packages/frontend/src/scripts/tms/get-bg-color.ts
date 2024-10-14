/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getBgColor = (elem?: Element | null | undefined): string | null => {
	if (elem == null) return null;

	const { backgroundColor: bg } = window.getComputedStyle(elem);

	if (bg && !['rgba(0, 0, 0, 0)', 'rgba(0,0,0,0)', 'transparent'].includes(bg)) {
		return bg;
	}

	return elem.parentElement == null ? null : getBgColor(elem.parentElement);
};
