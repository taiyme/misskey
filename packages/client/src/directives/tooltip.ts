// TODO: useTooltip関数使うようにしたい
// ただディレクティブ内でonUnmountedなどのcomposition api使えるのか不明

import { defineAsyncComponent, Directive, ref } from 'vue';
import { isTouchUsing } from '@/scripts/touch';
import { popup, alert } from '@/os';

const start = isTouchUsing ? 'touchstart' : 'mouseover';
const end = isTouchUsing ? 'touchend' : 'mouseleave';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		const delay = binding.modifiers.noDelay ? 0 : 100;

		const self = (src as any)._tooltipDirective_ = {} as any;

		self.text = binding.value;
		self._close = null;
		self.showTimer = null;
		self.hideTimer = null;
		self.checkTimer = null;

		self.close = (): void => {
			if (self._close) {
				window.clearInterval(self.checkTimer);
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
				direction: binding.modifiers.left ? 'left' : binding.modifiers.right ? 'right' : binding.modifiers.top ? 'top' : binding.modifiers.bottom ? 'bottom' : 'top',
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
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			self.showTimer = window.setTimeout(self.show, delay);
		}, { passive: true });

		src.addEventListener(end, () => {
			window.clearTimeout(self.showTimer);
			window.clearTimeout(self.hideTimer);
			self.hideTimer = window.setTimeout(self.close, delay);
		}, { passive: true });

		src.addEventListener('click', () => {
			window.clearTimeout(self.showTimer);
			self.close();
		});
	},

	updated(src, binding) {
		const self = (src as any)._tooltipDirective_;
		self.text = binding.value;
	},

	unmounted(src) {
		const self = (src as any)._tooltipDirective_;
		window.clearInterval(self.checkTimer);
	},
} as Directive<HTMLElement, string>;
