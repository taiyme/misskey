import { VNode, h } from 'vue';
import MkLinkDlsite from '@/components/MkDlsite.link.vue';

export const REGEX_DLSITE_PID = /[RVB][JE]\d{5,}/g;
export const DLSITE_PRODUCT_URL = 'https://www.dlsite.com/home/work/=/product_id/';

type ParsedMfmText = {
	type: 'text';
	value: string;
} | {
	type: 'dlsite_pid';
	value: string;
	url: `${typeof DLSITE_PRODUCT_URL}${string}`;
};

export const parseMfmText = (text: string, parents: string[]): (VNode | string)[] => {
	if (parents.includes('link') || parents.includes('plain')) return [text];

	const _parse = (_text: string): ParsedMfmText[] => {
		const matches = _text.match(REGEX_DLSITE_PID);
		if (!matches) return [{ type: 'text', value: _text }];

		const result: ParsedMfmText[] = [];
		let currentIndex = 0;

		matches.forEach(match => {
			const index = text.indexOf(match, currentIndex);
			if (index > currentIndex) result.push({ type: 'text', value: text.substring(currentIndex, index) });
			result.push({ type: 'dlsite_pid', value: match, url: `${DLSITE_PRODUCT_URL}${match}` });
			currentIndex = index + match.length;
		});

		if (currentIndex < text.length) result.push({ type: 'text', value: text.substring(currentIndex) });
		return result;
	};

	return _parse(text).map((props) => {
		const { type, value } = props;
		switch (type) {
			case 'text': {
				return value;
			}
			case 'dlsite_pid': {
				const { url } = props;
				return h(MkLinkDlsite, { key: `${type}:${value}`, url }, value);
			}
		}
	});
};
