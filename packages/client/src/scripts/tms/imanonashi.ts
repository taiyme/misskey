import { defaultStore } from '@/store';

type NoteLike = {
	text?: string | null;
}

export const isImanonashi = ({ text }: NoteLike): boolean => {
	if (!text) return false;

	const words = defaultStore.state.tmsImanonashiWords;
	if (words.length === 0) return false;

	return words.some(filter => {
		if (Array.isArray(filter)) {
			// Clean up
			const filteredFilter = filter.filter(keyword => keyword !== '');
			if (filteredFilter.length === 0) return false;

			return filteredFilter.every(keyword => text.includes(keyword));
		} else {
			// represents RegExp
			const regexp = filter.match(/^\/(.+)\/(.*)$/);

			// This should never happen due to input sanitisation.
			if (!regexp) return false;

			try {
				const [, pattern, flags] = regexp;
				return new RegExp(pattern, flags).test(text);
			} catch (err) {
				// This should never happen due to input sanitisation.
				return false;
			}
		}
	});
};
