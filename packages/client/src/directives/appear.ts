import { Directive } from 'vue';

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
