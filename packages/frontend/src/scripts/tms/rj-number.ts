/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type VNode, h } from 'vue';
import TmsRjNumber from '@/components/TmsRjNumber.vue';

class RjNumber {
	public static readonly WORK_SYMBOL = Symbol();
	public static readonly WORK_REGEX = /[RVB][JE]\d{6,}/g;
	public static getWorkUrl(rj: string): string {
		return `https://www.dlsite.com/home/work/=/product_id/${rj}.html`;
	}

	public static readonly CIRCLE_SYMBOL = Symbol();
	public static readonly CIRCLE_REGEX = /[RVB][G]\d{5,}/g;
	public static getCircleUrl(rg: string): string {
		return `https://www.dlsite.com/home/circle/profile/=/maker_id/${rg}.html`;
	}
}

type ParsedNode = {
	readonly type: 'text' | typeof RjNumber.WORK_SYMBOL | typeof RjNumber.CIRCLE_SYMBOL;
	readonly value: string;
};

const parseNodes = (parsedNodes: ParsedNode[], type: ParsedNode['type'], regexp: RegExp): ParsedNode[] => {
	return parsedNodes.flatMap((node) => {
		if (node.type !== 'text') return node;

		const matches = node.value.match(regexp);
		if (matches == null) return node;

		const result: ParsedNode[] = [];
		let currentIndex = 0;

		matches.forEach((match) => {
			const index = node.value.indexOf(match, currentIndex);
			if (index > currentIndex) {
				result.push({
					type: 'text' as const,
					value: node.value.substring(currentIndex, index),
				});
			}
			result.push({ type, value: match });
			currentIndex = index + match.length;
		});

		if (currentIndex < node.value.length) {
			result.push({
				type: 'text' as const,
				value: node.value.substring(currentIndex),
			});
		}

		return result;
	});
};

export const parseMfmRjNumber = (text: string): (VNode | string)[] => {
	let parsedNodes: ParsedNode[] = [{ type: 'text' as const, value: text }];
	parsedNodes = parseNodes(parsedNodes, RjNumber.WORK_SYMBOL, RjNumber.WORK_REGEX);
	parsedNodes = parseNodes(parsedNodes, RjNumber.CIRCLE_SYMBOL, RjNumber.CIRCLE_REGEX);

	return parsedNodes.map(({ type, value }) => {
		switch (type) {
			case 'text': {
				return value;
			}
			case RjNumber.WORK_SYMBOL: {
				return h(TmsRjNumber, {
					key: value,
					rjNumber: value,
					url: RjNumber.getWorkUrl(value),
				});
			}
			case RjNumber.CIRCLE_SYMBOL: {
				return h(TmsRjNumber, {
					key: value,
					rjNumber: value,
					url: RjNumber.getCircleUrl(value),
				});
			}
		}
	});
};
