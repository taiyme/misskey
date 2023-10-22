/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src) {
		const isTransparent = (color?: string | null): boolean => {
			if (!color) return false;
			if (color === 'transparent') return true;
			const [_r, _g, _b, alpha = null] = [...color.match(/\d+(\.\d+)?/g) ?? []];
			return alpha === '0';
		};

		const getBgColor = (el: HTMLElement | null): string => {
			if (!el) return 'transparent';
			const { backgroundColor } = window.getComputedStyle(el);
			if (backgroundColor && !isTransparent(backgroundColor)) {
				return backgroundColor;
			} else {
				return getBgColor(el.parentElement);
			}
		};

		const parentBg = getBgColor(src.parentElement);

		const { backgroundColor: myBg } = window.getComputedStyle(src);

		if (parentBg === myBg) {
			src.style.borderColor = 'var(--divider)';
		} else {
			src.style.borderColor = myBg;
		}
	},
} as Directive<HTMLElement>;
