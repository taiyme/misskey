import { computed, Ref, ComputedRef } from 'vue';
import { length } from 'stringz';

type TextCounterPropsType = {
	text: Ref<unknown | string>;
	maxChars: unknown | number;
};

type TextCounterResultType = {
	ok: true;
	chars: number;
	maxChars: number;
	remainingChars: number;
	isOver: boolean;
} | {
	ok: false;
};

const isText = (v: Ref<unknown>): v is Ref<string> => {
	return typeof v.value === 'string';
};

const isMaxChars = (v: unknown): v is number => {
	return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v) && v >= 0;
};

export const textCounter = ({ text, maxChars }: TextCounterPropsType): ComputedRef<TextCounterResultType> => {
	return computed<TextCounterResultType>(() => {
		if (!isText(text) || !isMaxChars(maxChars)) return { ok: false };
		const chars = length(text.value);
		const remainingChars = maxChars - chars;
		const isOver = chars > maxChars;
		return { ok: true, chars, maxChars, remainingChars, isOver };
	});	
};
