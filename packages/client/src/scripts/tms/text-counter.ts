import { computed, Ref, ComputedRef } from 'vue';
import { length } from 'stringz';

type TextCounterPropsType = {
	text: Ref<unknown> | Ref<unknown>[];
	maxChars: number;
};

type TextCounterResultType = {
	isRemaining: true;
	chars: number;
	maxChars: number;
	remainingChars: number;
	isOver: boolean;
} | {
	isRemaining: false;
	chars: number;
};

export const textCounter = (props: TextCounterPropsType): ComputedRef<TextCounterResultType> => {
	const inputs = Array.isArray(props.text) ? props.text : [props.text];
	const { maxChars } = props;
	const isRemaining = Number.isInteger(maxChars) && maxChars >= 0;

	return computed(() => {
		const chars = length(inputs.map(({ value }) => typeof value === 'string' ? value : '').join('').trim());
		if (!isRemaining) return { isRemaining, chars };
		return { isRemaining, chars, maxChars, remainingChars: maxChars - chars, isOver: chars > maxChars };
	});
};
