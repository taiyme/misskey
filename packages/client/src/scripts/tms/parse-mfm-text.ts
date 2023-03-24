import { VNode, h } from 'vue';
import MkLink from '@/components/MkLink.vue';

export const REGEX_DLSITE_PID = /[RVB][JE]\d{5,}/g;
export const DLSITE_PRODUCT_URL = 'https://www.dlsite.com/home/work/=/product_id/';
export const REGEX_DLSITE_MID = /[RVB][G]\d{5,}/g;
export const DLSITE_MAKER_URL = 'https://www.dlsite.com/home/circle/profile/=/maker_id/';

type ParsedMfmText = {
	type: 'text';
	value: string;
} | {
	type: 'dlsite_pid';
	value: string;
	url: `${typeof DLSITE_PRODUCT_URL}${string}`;
} | {
	type: 'dlsite_mid';
	value: string;
	url: `${typeof DLSITE_MAKER_URL}${string}`;
};

export const parseMfmText = (text: string): (VNode | string)[] => {
	const _parse = (_text: string): ParsedMfmText[] => {
		const result: ParsedMfmText[] = [];
		
		let lastIndex = 0;
		while (lastIndex < _text.length) {
			const pidMatch = REGEX_DLSITE_PID.exec(_text.slice(lastIndex));
			const midMatch = REGEX_DLSITE_MID.exec(_text.slice(lastIndex));
			const nextIndex = Math.min(
				pidMatch ? pidMatch.index : _text.length,
				midMatch ? midMatch.index : _text.length,
			);
			
			if (nextIndex > lastIndex) {
				const value = _text.slice(lastIndex, nextIndex);
				result.push({ type: 'text', value });
			}
			
			if (pidMatch && pidMatch.index === 0) {
				const value = pidMatch[0];
				result.push({ type: 'dlsite_pid', value, url: `${DLSITE_PRODUCT_URL}${value}` });
			}
			
			if (midMatch && midMatch.index === 0) {
				const value = midMatch[0];
				result.push({ type: 'dlsite_mid', value, url: `${DLSITE_MAKER_URL}${value}` });
			}
			
			lastIndex = nextIndex + Math.max(pidMatch?.[0]?.length ?? 0, midMatch?.[0]?.length ?? 0);
		}
		
		return result;
	};

	return _parse(text).map((props) => {
		const { type, value } = props;
		switch (type) {
			case 'text': {
				return value;
			}
			case 'dlsite_pid':
			case 'dlsite_mid': {
				const { url } = props;
				return h(MkLink, { key: `${type}:${value}`, url, rel: 'nofollow noopener' }, value);
			}
		}
	});
};
