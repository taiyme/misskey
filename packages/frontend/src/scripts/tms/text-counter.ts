/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ComputedRef, type Ref, computed } from 'vue';

//#region textLength
/*
 * NOTE: misskey-dev/misskey の実装において、文字数の扱いはほぼ考慮されておらず、実装がまちまちである。
 *       - String.prototype.length -> text.length
 *       - Array.prototype.length  -> [...text].length
 *       - ucs2length(text)        -> https://github.com/ajv-validator/ajv/blob/master/lib/runtime/ucs2length.ts
 *       - length(text)            -> https://github.com/sallar/stringz/blob/master/src/index.ts
 *       バックエンドの Ajv の内部では ucs2length を、その後の処理では String.prototype.slice を使用しているようである。
 *       バックエンド側で削られてしまうのを防ぐため、ここでは String.prototype.length を使用することにする。
 */
const textLength = (str: string): number => {
	return str.length;
};
//#endregion

export type CounterProps = {
	readonly input: Ref<string | null | undefined>[];
	readonly maxChars?: number;
	readonly separator?: string;
	readonly trim?: boolean;
};

type CounterBase = {
	readonly chars: number;
};

export type Counter = (
	| CounterBase & {
		readonly hasLimit: false;
	}
	| CounterBase & {
		readonly hasLimit: true;
		readonly isOver: boolean;
		readonly overChars: number;
		readonly maxChars: number;
	}
);

export const textCounter = (props: CounterProps): ComputedRef<Counter> => {
	const input = props.input;
	const separator = props.separator ?? '';
	const trim = props.trim ?? false;
	const maxChars = props.maxChars ?? Infinity;
	const hasLimit = maxChars !== Infinity;
	if (input.length === 0) {
		throw new Error('\'props.input\' must not be empty.');
	}
	if (maxChars !== Infinity) {
		if (maxChars < 0) throw new Error('\'props.maxChars\' must be a non-negative integer.');
		if (!Number.isInteger(maxChars)) throw new Error('\'props.maxChars\' must be an integer.');
	}
	return computed<Counter>(() => {
		const raw = input.map(v => v.value ?? '').join(separator);
		const text = trim ? raw.trim() : raw;
		const chars = textLength(text);
		if (!hasLimit) return { hasLimit, chars } as const;
		const isOver = chars > maxChars;
		const overChars = maxChars - chars;
		return { hasLimit, chars, isOver, overChars, maxChars } as const;
	});
};
