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
			[$style.tall]: tall,
			[$style.pre]: pre,
			[$style.focused]: focused,
			[$style.disabled]: disabled,
			[$style.invalid]: invalid || userInvalid,
		}"
		style="position: relative;"
	>
		<textarea
			ref="inputEl"
			v-model="v"
			v-adaptive-border
			:class="[$style.textarea, { _monospace: code }]"
			:disabled="disabled"
			:required="required"
			:readonly="readonly"
			:placeholder="placeholder"
			:pattern="pattern"
			:autocomplete="autocomplete"
			:spellcheck="spellcheck"
			@focus="focused = true"
			@blur="focused = false"
			@keydown="onKeydown"
			@input="onInput"
		></textarea>
	</div>
	<div :class="$style.caption"><slot name="caption"/></div>

	<MkButton v-if="manualSave && changed" primary :disabled="invalid || userInvalid" :class="$style.save" @click="updated"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup generic="GenericNullable extends boolean = false">
import { computed, onMounted, nextTick, ref, watch, toRefs, shallowRef } from 'vue';
import { debounce } from 'throttle-debounce';
import MkButton from '@/components/MkButton.vue';
import TmsTextCount from '@/components/TmsTextCount.vue';
import { i18n } from '@/i18n.js';
import { textCounter } from '@/scripts/tms/text-counter.js';

type ValueOrNullable<T> = GenericNullable extends true ? T | null : T;
type GenericValue = ValueOrNullable<string>;

const props = defineProps<{
	modelValue: GenericValue; // generics
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
	debounce?: boolean;
	manualSave?: boolean;
	code?: boolean;
	tall?: boolean;
	pre?: boolean;
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
	caption?(): any;
}>();

const { modelValue, autofocus } = toRefs(props);
const v = ref<string>(
	// stringであればそのまま
	typeof modelValue.value === 'string'
		? modelValue.value
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
	return raw as GenericValue;
});
const userInvalid = computed(() => {
	if (!changed.value) return false;
	const raw = props.trim ? v.value.trim() : v.value;
	if (props.nullable && raw === '') return false;
	return !!inputEl.value?.validity.badInput || (counter.value.hasLimit && counter.value.isOver);
});
const focused = ref(false);
const changed = ref(false);
const invalid = ref(false);
const inputEl = shallowRef<HTMLTextAreaElement>();

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
const onKeydown = (ev: KeyboardEvent): void => {
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

onMounted(() => {
	nextTick(() => {
		if (autofocus.value) {
			focus();
		}
	});
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

.textarea {
	-webkit-appearance: none;
	appearance: none;
	display: block;
	width: 100%;
	min-width: 100%;
	max-width: 100%;
	min-height: 130px;
	margin: 0;
	padding: 12px;
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

.focused {
	> .textarea {
		border-color: var(--accent) !important;
	}
}

.invalid {
	> .textarea {
		border-color: var(--error) !important;
	}
}

.disabled {
	opacity: 0.7;
	cursor: not-allowed !important;

	> .textarea {
		cursor: not-allowed !important;
	}
}

.tall {
	> .textarea {
		min-height: 200px;
	}
}

.pre {
	> .textarea {
		white-space: pre;
	}
}

.save {
	margin: 8px 0 0 0;
}
</style>
