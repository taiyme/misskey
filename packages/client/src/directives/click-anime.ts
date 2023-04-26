import { Directive } from 'vue';
import { defaultStore } from '@/store';
import { arrayAt } from '@/scripts/tms/utils';

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src) {
		if (!defaultStore.state.animation) return;

		const target = arrayAt(src.children, 0);

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
