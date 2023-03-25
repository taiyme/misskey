import { VNode, h } from 'vue';
import MkLinkDlsite from '@/components/MkDlsite.link.vue';

export const DLSITE_PID = 'dlsite_pid';
export const DLSITE_PID_REGEXP = /[RVB][JE]\d{5,}/g;
export const DLSITE_PID_BASEURL = 'https://www.dlsite.com/home/work/=/product_id/';

export const DLSITE_MID = 'dlsite_mid';
export const DLSITE_MID_REGEXP = /[RVB][G]\d{5,}/g;
export const DLSITE_MID_BASEURL = 'https://www.dlsite.com/home/circle/profile/=/maker_id/';

type ParsedMfmText = {
	type: 'text' | typeof DLSITE_PID | typeof DLSITE_MID;
	value: string;
}

export const parseMfmText = (text: string, parents: string[]): (VNode | string)[] => {
	if (parents.includes('link') || parents.includes('plain')) return [text];

	const _parse = (parsed: ParsedMfmText[], type: ParsedMfmText['type'], regexp: RegExp): ParsedMfmText[] => {
		return parsed.flatMap(props => {
			if (props.type !== 'text') return props;

			const matches = props.value.match(regexp);
			if (!matches) return props;

			const result: ParsedMfmText[] = [];
			let currentIndex = 0;

			matches.forEach(match => {
				const index = props.value.indexOf(match, currentIndex);
				if (index > currentIndex) result.push({ type: 'text', value: text.substring(currentIndex, index) });
				result.push({ type, value: match });
				currentIndex = index + match.length;
			});

			if (currentIndex < props.value.length) result.push({ type: 'text', value: props.value.substring(currentIndex) });
			return result;
		}, Infinity);
	};

	let parsed: ParsedMfmText[] = [{ type: 'text', value: text }];
	parsed = _parse(parsed, DLSITE_PID, DLSITE_PID_REGEXP);
	parsed = _parse(parsed, DLSITE_MID, DLSITE_MID_REGEXP);

	return parsed.map(({ type, value }) => {
		switch (type) {
			case 'text': {
				return value;
			}
			case DLSITE_PID: {
				return h(MkLinkDlsite, {
					key: value,
					url: `${DLSITE_PID_BASEURL}${value}`,
				}, value);
			}
			case DLSITE_MID: {
				return h(MkLinkDlsite, {
					key: value,
					url: `${DLSITE_MID_BASEURL}${value}`,
				}, value);
			}
		}
	});
};
