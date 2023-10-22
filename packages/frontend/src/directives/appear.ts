/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';

const map = new WeakMap<HTMLElement, IntersectionObserver>();

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		const fn = binding.value;
		if (fn == null) return;

		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				fn();
			}
		});
		observer.observe(src);
		map.set(src, observer);
	},

	unmounted(src) {
		const observer = map.get(src);
		if (observer) {
			observer.disconnect();
			map.delete(src);
		}
	},
} as Directive<HTMLElement, (() => void) | null | undefined>;
