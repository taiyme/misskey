/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';
import { popup } from '@/os.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		// 明示的に false であればバインドしない
		if (binding.value === false) return;

		src.addEventListener('click', () => {
			const { offsetWidth: width, offsetHeight: height } = src;
			const { top, left } = src.getBoundingClientRect();

			const x = left + (width / 2);
			const y = top + (height / 2);

			popup(MkRippleEffect, { x, y }, {}, 'end');
		});
	},
} as Directive<HTMLElement, boolean>;
