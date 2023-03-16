<!-- eslint-disable vue/multi-word-component-names -->
<template>
<div class="adhpbeos">
	<div class="label" @click="focus">
		<span v-if="$slots.label" class="label-text"><slot name="label"></slot></span>
		<span v-if="textLength != null && maxTextLength != null" class="text-count" :class="{ over: textLength > maxTextLength }">{{ maxTextLength - textLength }}</span>
	</div>
	<div class="input" :class="{ disabled, focused, invalid, tall, pre }">
		<textarea
			ref="inputEl"
			v-model="v"
			v-adaptive-border
			:class="{ code, _monospace: code }"
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
	<div class="caption"><slot name="caption"></slot></div>

	<MkButton v-if="manualSave && changed" primary class="save" @click="updated"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick, ref, watch, toRefs } from 'vue';
import { debounce } from 'throttle-debounce';
import { length } from 'stringz';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	modelValue: string;
	type?: string;
	required?: boolean;
	readonly?: boolean;
	disabled?: boolean;
	pattern?: string;
	placeholder?: string;
	autofocus?: boolean;
	autocomplete?: string;
	spellcheck?: boolean;
	code?: boolean;
	tall?: boolean;
	pre?: boolean;
	debounce?: boolean;
	manualSave?: boolean;
	max?: number;
}>();

const emit = defineEmits<{
	(ev: 'change', _ev: Event): void;
	(ev: 'keydown', _ev: KeyboardEvent): void;
	(ev: 'enter'): void;
	(ev: 'update:modelValue', value: string | number): void;
}>();

const { modelValue, autofocus } = toRefs(props);
const v = ref(modelValue.value);
const focused = ref(false);
const changed = ref(false);
const invalid = ref(false);
const inputEl = ref<HTMLTextAreaElement>();

const textLength = $computed((): number | null => {
	if (props.type && props.type !== 'text') return null;
	if (typeof v.value !== 'string') return null;
	return length(v.value);
});

const maxTextLength = $computed((): number | null => {
	if (props.type && props.type !== 'text') return null;
	return props.max ?? null;
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
	emit('update:modelValue', v.value);
};

const debouncedUpdated = debounce(1000, updated);

watch(modelValue, newValue => {
	v.value = newValue;
});

watch(v, () => {
	invalid.value = !!inputEl.value?.validity.badInput || (textLength != null && maxTextLength != null && textLength > maxTextLength);

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

<style lang="scss" scoped>
.adhpbeos {
	> .label {
		font-size: 0.85em;
		padding: 0 0 8px 0;
		user-select: none;
		min-height: 1.35em; // line-height
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;

		&:empty {
			display: none;
		}

		> .label-text {
			overflow-wrap: break-word;
		}

		> .text-count {
			opacity: 0.7;

			&.over {
				color: var(--error);
			}
		}
	}

	> .caption {
		font-size: 0.85em;
		padding: 8px 0 0 0;
		color: var(--fgTransparentWeak);

		&:empty {
			display: none;
		}
	}

	> .input {
		position: relative;

		> textarea {
			appearance: none;
			-webkit-appearance: none;
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

		&.focused {
			> textarea {
				border-color: var(--accent) !important;
			}
		}

		&.disabled {
			opacity: 0.7;

			&, * {
				cursor: not-allowed !important;
			}
		}

		&.tall {
			> textarea {
				min-height: 200px;
			}
		}

		&.pre {
			> textarea {
				white-space: pre;
			}
		}
	}

	> .save {
		margin: 8px 0 0 0;
	}
}
</style>
