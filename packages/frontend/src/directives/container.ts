/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';

type Value = {
	type?: ContainerType;
};

type ContainerType = 'inlineSize' | 'size' | 'normal';

const supported = window.CSS.supports('width', '1cqw') && window.CSS.supports('height', '1cqh');

const map = supported ? null : new WeakMap<HTMLElement, ResizeObserver>();

const calc = (el: HTMLElement, type: ContainerType): void => {
	if (type === 'inlineSize' || type === 'size') {
		el.style.setProperty('--cqw', `${el.offsetWidth * 0.01}px`);
	} else {
		el.style.removeProperty('--cqw');
	}
	if (type === 'size') {
		el.style.setProperty('--cqh', `${el.offsetHeight * 0.01}px`);
	} else {
		el.style.removeProperty('--cqh');
	}
};

const clear = (el: HTMLElement): void => {
	el.style.removeProperty('--cqw');
	el.style.removeProperty('--cqh');
};

export default {
	mounted(src, binding) {
		if (!map) return;
		const { type = 'normal' } = binding.value;
		const ro = new ResizeObserver(() => {
			calc(src, type);
		});
		ro.observe(src);
		map.set(src, ro);
	},

	unmounted(src) {
		if (!map) return;
		const ro = map.get(src);
		ro?.disconnect();
		map.delete(src);
		clear(src);
	},
} as Directive<HTMLElement, Value>;
