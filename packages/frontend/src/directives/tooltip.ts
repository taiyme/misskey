/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// TODO: useTooltip関数使うようにしたい
// ただディレクティブ内でonUnmountedなどのcomposition api使えるのか不明

import { type Directive, defineAsyncComponent, ref } from 'vue';
import { isTouchUsing } from '@/scripts/touch.js';
import { popup, alert } from '@/os.js';

type TooltipDirective = {
	text?: string;
	close?: (() => void) | null;
	_close?: (() => void) | null;
	show?: (() => void) | null;
	showTimer?: number | null;
	hideTimer?: number | null;
	checkTimer?: number | null;
};

type TooltipElement = HTMLElement & {
	_tooltipDirective_?: TooltipDirective | null;
};

const start = isTouchUsing ? 'touchstart' : 'mouseenter';
const end = isTouchUsing ? 'touchend' : 'mouseleave';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		const delay = binding.modifiers.noDelay ? 0 : 100;

		const self = src._tooltipDirective_ = ({} as TooltipDirective);

		self.text = binding.value;
		self._close = null;
		self.showTimer = null;
		self.hideTimer = null;
		self.checkTimer = null;

		self.close = (): void => {
			if (self._close) {
				if (self.checkTimer) window.clearInterval(self.checkTimer);
				self._close();
				self._close = null;
			}
		};

		if (binding.arg === 'dialog') {
			src.addEventListener('click', (ev: MouseEvent) => {
				ev.preventDefault();
				ev.stopPropagation();
				alert({
					type: 'info',
					text: binding.value,
				});
				return false;
			});
		}

		self.show = (): void => {
			if (!document.body.contains(src)) return;
			if (self._close) return;
			if (self.text == null) return;

			const showing = ref(true);
			popup(defineAsyncComponent(() => import('@/components/MkTooltip.vue')), {
				showing,
				text: self.text,
				asMfm: binding.modifiers.mfm,
				direction: (
					binding.modifiers.left
						? 'left'
						: binding.modifiers.right
							? 'right'
							: binding.modifiers.top
								? 'top'
								: binding.modifiers.bottom
									? 'bottom'
									: 'top'
				),
				targetElement: src,
			}, {}, 'closed');

			self._close = (): void => {
				showing.value = false;
			};
		};

		src.addEventListener('selectstart', ev => {
			ev.preventDefault();
		});

		src.addEventListener(start, () => {
			if (self.showTimer) window.clearTimeout(self.showTimer);
			if (self.hideTimer) window.clearTimeout(self.hideTimer);
			if (self.show) self.showTimer = window.setTimeout(self.show, delay);
		}, { passive: true });

		src.addEventListener(end, () => {
			if (self.showTimer) window.clearTimeout(self.showTimer);
			if (self.hideTimer) window.clearTimeout(self.hideTimer);
			if (self.close) self.hideTimer = window.setTimeout(self.close, delay);
		}, { passive: true });

		src.addEventListener('click', () => {
			if (self.showTimer) window.clearTimeout(self.showTimer);
			if (self.close) self.close();
		});
	},

	updated(src, binding) {
		const self = src._tooltipDirective_;
		if (!self) return;
		self.text = binding.value;
	},

	unmounted(src) {
		const self = src._tooltipDirective_;
		if (!self) return;
		if (self.checkTimer) window.clearInterval(self.checkTimer);
	},
} as Directive<TooltipElement, string>;
