import { Directive } from 'vue';
import { getScrollContainer, getScrollPosition } from '@/scripts/scroll';

const map = new WeakMap<HTMLElement, ResizeObserver>();

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		if (binding.value === false) return;

		let isBottom = true;

		const container = getScrollContainer(src);
		if (!container) return;

		container.addEventListener('scroll', () => {
			const pos = getScrollPosition(container);
			const viewHeight = container.clientHeight;
			const height = container.scrollHeight;
			isBottom = (pos + viewHeight > height - 32);
		}, { passive: true });
		container.scrollTop = container.scrollHeight;

		const ro = new ResizeObserver(() => {
			if (isBottom) {
				const height = container.scrollHeight;
				container.scrollTop = height;
			}
		});
		ro.observe(src);
		map.set(src, ro);
	},

	unmounted(src) {
		const ro = map.get(src);
		if (ro) {
			ro.disconnect();
			map.delete(src);
		}
	},
} as Directive<HTMLElement, boolean>;
