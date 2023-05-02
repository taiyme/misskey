import { VNode, h } from 'vue';
import TmsDlsiteLink from '@/components/TmsDlsiteLink.vue';

const EXCLUDE_MFM_NODE_TYPES = ['link', 'plain'];

export const DLSITE_PID = 'dlsite_pid';
export const DLSITE_PID_REGEXP = /[RVB][JE]\d{6,}/g;
export const DLSITE_PID_BASEURL = 'https://www.dlsite.com/home/announce/=/product_id/{{product_id}}.html';

export const DLSITE_MID = 'dlsite_mid';
export const DLSITE_MID_REGEXP = /[RVB][G]\d{5,}/g;
export const DLSITE_MID_BASEURL = 'https://www.dlsite.com/home/circle/profile/=/maker_id/{{maker_id}}.html';

type ParsedType = {
	type: 'text' | typeof DLSITE_PID | typeof DLSITE_MID;
	value: string;
}

const parseType = (parsed: ParsedType[], type: ParsedType['type'], regexp: RegExp): ParsedType[] => {
	return parsed.flatMap(props => {
		if (props.type !== 'text') return props;

		const matches = props.value.match(regexp);
		if (!matches) return props;

		const result: ParsedType[] = [];
		let currentIndex = 0;

		matches.forEach(match => {
			const index = props.value.indexOf(match, currentIndex);
			if (index > currentIndex) result.push({ type: 'text', value: props.value.substring(currentIndex, index) });
			result.push({ type, value: match });
			currentIndex = index + match.length;
		});

		if (currentIndex < props.value.length) result.push({ type: 'text', value: props.value.substring(currentIndex) });
		return result;
	}, Infinity);
};

export const parseMfmText = (text: string, parents: string[]): (VNode | string)[] => {
	if (parents.some(parent => EXCLUDE_MFM_NODE_TYPES.includes(parent))) return [text];

	let parsed: ParsedType[] = [{ type: 'text', value: text }];
	parsed = parseType(parsed, DLSITE_PID, DLSITE_PID_REGEXP);
	parsed = parseType(parsed, DLSITE_MID, DLSITE_MID_REGEXP);

	return parsed.map(({ type, value }) => {
		switch (type) {
			case 'text': {
				return value;
			}
			case DLSITE_PID: {
				return h(TmsDlsiteLink, {
					key: value,
					value,
					url: DLSITE_PID_BASEURL.replace('{{product_id}}', value),
				});
			}
			case DLSITE_MID: {
				return h(TmsDlsiteLink, {
					key: value,
					value,
					url: DLSITE_MID_BASEURL.replace('{{maker_id}}', value),
				});
			}
		}
	});
};
