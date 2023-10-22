/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive } from 'vue';

type Mounting = {
	resize: ResizeObserver;
	intersection?: IntersectionObserver | null;
	fn: (w: number, h: number) => void;
};

const mountings = new Map<HTMLElement, Mounting>();

const calc = (el: HTMLElement): void => {
	const info = mountings.get(el);
	const {
		clientWidth: width,
		clientHeight: height,
	} = el;

	if (!info) return;

	// アクティベート前などでsrcが描画されていない場合
	if (!height) {
		// IntersectionObserverで表示検出する
		if (!info.intersection) {
			info.intersection = new IntersectionObserver(entries => {
				if (entries.some(entry => entry.isIntersecting)) calc(el);
			});
		}
		info.intersection.observe(el);
		return;
	}
	if (info.intersection) {
		info.intersection.disconnect();
		info.intersection = null;
	}

	info.fn(width, height);
};

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		const resize = new ResizeObserver(() => {
			calc(src);
		});
		resize.observe(src);

		mountings.set(src, { resize, fn: binding.value });
		calc(src);
	},

	unmounted(src, binding) {
		binding.value(0, 0);
		const info = mountings.get(src);
		if (!info) return;
		info.resize.disconnect();
		if (info.intersection) info.intersection.disconnect();
		mountings.delete(src);
	},
} as Directive<HTMLElement, (w: number, h: number) => void>;
