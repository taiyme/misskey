<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div :class="$style.label" @click="focus">
		<span v-if="slots.label || counter.hasLimit" :class="$style.labelText"><slot name="label"/></span>
		<span v-if="counter.hasLimit"><TmsTextCount :counter="counter"/></span>
	</div>
	<div
		:class="{
			[$style.input]: true,
			[$style.inline]: inline,
			[$style.disabled]: disabled,
			[$style.focused]: focused,
			[$style.invalid]: invalid || userInvalid,
		}"
	>
		<div ref="prefixEl" :class="$style.prefix"><slot name="prefix"/></div>
		<input
			ref="inputEl"
			v-model="v"
			v-adaptive-border
			:class="$style.inputCore"
			:type="type"
			:disabled="disabled"
			:required="required"
			:readonly="readonly"
			:placeholder="placeholder"
			:pattern="pattern"
			:autocomplete="autocomplete"
			:spellcheck="spellcheck"
			:step="step"
			:list="id"
			:min="min"
			:max="max"
			@focus="focused = true"
			@blur="focused = false"
			@keydown="onKeydown"
			@input="onInput"
		/>
		<datalist v-if="datalist" :id="id">
			<option v-for="data in datalist" :key="data" :value="data"/>
		</datalist>
		<div ref="suffixEl" :class="$style.suffix"><slot name="suffix"/></div>
	</div>
	<div :class="$style.caption"><slot name="caption"/></div>

	<MkButton v-if="manualSave && changed" primary :disabled="invalid || userInvalid" :class="$style.save" @click="updated"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup generic="GenericInputType extends InputType = 'text', GenericNullable extends boolean = false">
import { computed, onMounted, nextTick, ref, shallowRef, watch, toRefs } from 'vue';
import { debounce } from 'throttle-debounce';
import { v4 as uuid } from 'uuid';
import MkButton from '@/components/MkButton.vue';
import TmsTextCount from '@/components/TmsTextCount.vue';
import { useInterval } from '@/scripts/use-interval.js';
import { i18n } from '@/i18n.js';
import { textCounter } from '@/scripts/tms/text-counter.js';

export type InputType = 'text' | 'number' | 'password' | 'email' | 'url' | 'date' | 'time' | 'search' | 'datetime-local';

type ValueOrNullable<T> = GenericNullable extends true ? T | null : T;
type GenericValue = ValueOrNullable<GenericInputType extends 'number' ? number : string>;

const props = defineProps<{
	modelValue: GenericValue; // generics
	type?: GenericInputType; // generics
	nullable?: GenericNullable; // generics
	trim?: boolean;
	required?: boolean;
	readonly?: boolean;
	disabled?: boolean;
	pattern?: string;
	placeholder?: string;
	autofocus?: boolean;
	autocomplete?: string;
	spellcheck?: boolean;
	step?: number;
	datalist?: string[];
	min?: number;
	max?: number;
	inline?: boolean;
	debounce?: boolean;
	manualSave?: boolean;
	small?: boolean;
	large?: boolean;
	minLength?: number;
	maxLength?: number;
}>();

const emit = defineEmits<{
	change: [ev: Event];
	keydown: [ev: KeyboardEvent];
	enter: [];
	'update:modelValue': [value: GenericValue];
}>();

const slots = defineSlots<{
	label?(): any;
	prefix?(): any;
	suffix?(): any;
	caption?(): any;
}>();

const { type: _type, modelValue, autofocus } = toRefs(props);
const type = computed<InputType>(() => {
	return (props.type ?? 'text') satisfies InputType;
});
const v = ref<string>(
	// stringであればそのまま
	typeof modelValue.value === 'string'
		? modelValue.value
		// numberであればstringに変換
		: typeof modelValue.value === 'number'
			? String(modelValue.value)
			// null | undefinedであれば空文字
			: modelValue.value == null
				? ''
				// それ以外は空文字
				: ''
);
const computedValue = computed<GenericValue>(() => {
	const raw = props.trim ? v.value.trim() : v.value;
	if (props.nullable && !raw) {
		return null as GenericValue;
	}
	if (props.type === 'number') {
		return (parseFloat(raw.trim()) || 0) as GenericValue;
	}
	return raw as GenericValue;
});
const userInvalid = computed(() => {
	if (!changed.value) return false;
	const raw = props.trim ? v.value.trim() : v.value;
	if (props.nullable && raw === '') return false;
	if (props.type === 'number') {
		const min = props.min ?? -Infinity;
		const max = props.max ?? Infinity;
		const num = parseFloat(raw.trim()) || 0;
		return !(min <= num && num <= max);
	}
	return !!inputEl.value?.validity.badInput || (counter.value.hasLimit && counter.value.isOver);
});
const id = uuid();
const focused = ref(false);
const changed = ref(false);
const invalid = ref(false);
const inputEl = shallowRef<HTMLInputElement>();
const prefixEl = shallowRef<HTMLElement>();
const suffixEl = shallowRef<HTMLElement>();
const height =
	props.small ? 33 :
	props.large ? 39 :
	36;

const counter = textCounter({
	input: [v],
	maxChars: props.maxLength,
	trim: props.trim,
});

const focus = (): void => inputEl.value?.focus();
const onInput = (ev: Event): void => {
	changed.value = true;
	emit('change', ev);
};
const onKeydown = (ev: KeyboardEvent) => {
	if (ev.isComposing || ev.key === 'Process' || ev.keyCode === 229) return;

	emit('keydown', ev);

	if (ev.code === 'Enter') {
		emit('enter');
	}
};

const updated = (): void => {
	changed.value = false;
	emit('update:modelValue', computedValue.value);
};

const debouncedUpdated = debounce(1000, updated);

watch(modelValue, newValue => {
	v.value = newValue;
});

watch(v, () => {
	invalid.value = !!inputEl.value?.validity.badInput;

	if (!props.manualSave) {
		if (props.debounce) {
			debouncedUpdated();
		} else {
			updated();
		}
	}
});

// このコンポーネントが作成された時、非表示状態である場合がある
// 非表示状態だと要素の幅などは0になってしまうので、定期的に計算する
useInterval(() => {
	if (!inputEl.value) return;
	if (prefixEl.value) {
		if (prefixEl.value.offsetWidth) {
			inputEl.value.style.paddingLeft = `${prefixEl.value.offsetWidth}px`;
		}
	}
	if (suffixEl.value) {
		if (suffixEl.value.offsetWidth) {
			inputEl.value.style.paddingRight = `${suffixEl.value.offsetWidth}px`;
		}
	}
}, 100, {
	immediate: true,
	afterMounted: true,
});

onMounted(() => {
	nextTick(() => {
		if (autofocus.value) {
			focus();
		}
	});
});

defineExpose({
	focus,
});
</script>

<style lang="scss" module>
.label {
	font-size: 0.85em;
	padding: 0 0 8px 0;
	-webkit-user-select: none;
	user-select: none;
	min-height: 1.35em; // line-height
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 8px;

	&:empty {
		display: none;
	}

	> .labelText {
		overflow-wrap: break-word;
	}
}

.caption {
	font-size: 0.85em;
	padding: 8px 0 0 0;
	color: var(--fgTransparentWeak);

	&:empty {
		display: none;
	}
}

.input {
	position: relative;

	&.inline {
		display: inline-block;
		margin: 0;
	}

	&.focused {
		> .inputCore {
			border-color: var(--accent) !important;
			// box-shadow: 0 0 0 4px var(--focus);
		}
	}

	&.invalid {
		> .inputCore {
			border-color: var(--error) !important;
		}
	}

	&.disabled {
		opacity: 0.7;

		&,
		> .inputCore {
			cursor: not-allowed !important;
		}
	}
}

.inputCore {
	-webkit-appearance: none;
	appearance: none;
	display: block;
	height: v-bind("`${height}px`");
	width: 100%;
	margin: 0;
	padding: 0 12px;
	font: inherit;
	font-weight: normal;
	font-size: 1em;
	color: var(--fg);
	background: var(--panel);
	border: solid 1px var(--panel);
	border-radius: 6px;
	outline: none;
	box-shadow: none;
	box-sizing: border-box;
	transition: border-color 0.1s ease-out;

	&:hover {
		border-color: var(--inputBorderHover) !important;
	}
}

.prefix,
.suffix {
	display: flex;
	align-items: center;
	position: absolute;
	z-index: 1;
	top: 0;
	padding: 0 12px;
	font-size: 1em;
	height: v-bind("`${height}px`");
	min-width: 16px;
	max-width: 150px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	box-sizing: border-box;
	pointer-events: none;

	&:empty {
		display: none;
	}
}

.prefix {
	left: 0;
	padding-right: 6px;
}

.suffix {
	right: 0;
	padding-left: 6px;
}

.save {
	margin: 8px 0 0 0;
}
</style>
