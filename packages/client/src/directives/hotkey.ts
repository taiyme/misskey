import { Directive } from 'vue';
import { Keymap, makeHotkey } from '../scripts/hotkey';

const map = new WeakMap<HTMLElement, () => void>();

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		const global = binding.modifiers.global === true;
		const handler = makeHotkey(binding.value);

		if (global) {
			document.addEventListener('keydown', handler);
			map.set(src, () => document.removeEventListener('keydown', handler));
		} else {
			src.addEventListener('keydown', handler);
			map.set(src, () => src.removeEventListener('keydown', handler));
		}
	},

	unmounted(src) {
		const stopHandler = map.get(src);
		if (stopHandler) {
			stopHandler();
			map.delete(src);
		}
	},
} as Directive<HTMLElement, Keymap>;
