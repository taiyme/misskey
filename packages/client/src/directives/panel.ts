import { Directive } from 'vue';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src) {
		const isTransparent = (color?: string | null): boolean => {
			if (!color) return false;
			if (color === 'transparent') return true;
			const [_r, _g, _b, alpha = null] = [...color.match(/\d+/g) ?? []];
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

		const myBg = window.getComputedStyle(document.documentElement).getPropertyValue('--panel');

		if (parentBg === myBg) {
			src.style.backgroundColor = 'var(--bg)';
		} else {
			src.style.backgroundColor = 'var(--panel)';
		}
	},
} as Directive<HTMLElement>;
