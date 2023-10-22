/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';
import { defaultStore } from '@/store.js';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src) {
		if (!defaultStore.state.animation) return;

		const target = Array.from(src.children).at(0);

		if (target == null) return;

		target.classList.add('_anime_bounce_standBy');

		src.addEventListener('mousedown', () => {
			target.classList.remove('_anime_bounce');

			target.classList.add('_anime_bounce_standBy');
			target.classList.add('_anime_bounce_ready');

			target.addEventListener('mouseleave', () => {
				target.classList.remove('_anime_bounce_ready');
			});
		});

		src.addEventListener('click', () => {
			target.classList.add('_anime_bounce');
			target.classList.remove('_anime_bounce_ready');
		});

		src.addEventListener('animationend', () => {
			target.classList.remove('_anime_bounce');
			target.classList.add('_anime_bounce_standBy');
		});
	},
} as Directive<HTMLElement>;
