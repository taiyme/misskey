<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_s">
	<div :class="$style.textarea" @click="focus">
		<div :class="$style.heading"><slot name="heading"></slot></div>
		<textarea
			ref="inputEl"
			v-model="modelValue"
			:class="$style.core"
			rows="1"
			@input="adjustInputEl"
		/>
	</div>
	<div v-if="changed" class="_buttons">
		<MkButton small primary @click="update"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue';
import { i18n } from '@/i18n.js';
import MkButton from '@/components/MkButton.vue';

const props = defineProps<{
	modelValue: string;
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', value: string): void;
}>();

const inputEl = shallowRef<HTMLTextAreaElement>();

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const modelValue = ref(props.modelValue);

const beforeValue = ref(modelValue.value);

const changed = computed(() => modelValue.value !== beforeValue.value);

const update = () => {
	beforeValue.value = modelValue.value;
	emit('update:modelValue', modelValue.value);
};

const adjustInputEl = () => {
	if (!inputEl.value) return;
	inputEl.value.style.height = '0px';
	inputEl.value.offsetHeight; // reflow
	inputEl.value.style.height = `${inputEl.value.scrollHeight}px`;
};

const focus = () => {
	inputEl.value?.focus();
};

defineExpose({
	focus,
});
</script>

<style lang="scss" module>
.textarea {
	background: transparent;
	color: var(--fg);
	border: 1px solid var(--divider);
	border-radius: 8px;
	padding: 8px;
	line-height: 0;
	cursor: text;
}

.heading {
	text-align: left;
	color: var(--fgTransparent);
	line-height: 1.5;
	font-size: 85%;
	pointer-events: none;
	-webkit-user-select: none;
	user-select: none;
}

.core {
	margin: 0;
	padding: 0;
	resize: none;
	border: none;
	outline: none;
	width: 100%;
	height: auto;
	min-height: 0;
	line-height: 1.5;
	color: var(--fg);
	overflow: hidden;
	background: transparent;
	font-family: inherit;
}
</style>
