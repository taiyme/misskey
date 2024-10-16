<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	role="switch"
	tabindex="0"
	:aria-checked="checked"
	:aria-disabled="disabled"
	:class="{
		[$style.root]: true,
		[$style.disabled]: disabled,
	}"
	@keydown="onKeydown"
>
	<XButton :checked="checked" :disabled="disabled" @toggle="toggle"/>
	<span :class="$style.body">
		<!-- TODO: 無名slotの方は廃止 -->
		<span :class="$style.label">
			<span @click="toggle">
				<slot name="label"></slot><slot></slot>
			</span>
			<span v-if="helpText" v-tooltip:dialog="helpText" class="_button _help" :class="$style.help"><i class="ti ti-help-circle"></i></span>
		</span>
		<p :class="$style.caption"><slot name="caption"></slot></p>
	</span>
</div>
</template>

<script lang="ts" setup>
import { type MaybeRef, computed, unref } from 'vue';
import { filterKeyboardEnterOrSpace } from '@/scripts/tms/filter-keyboard.js';
import XButton from '@/components/MkSwitch.button.vue';

const props = withDefaults(defineProps<{
	modelValue: MaybeRef<boolean>;
	disabled?: MaybeRef<boolean>;
	helpText?: string;
}>(), {
	disabled: false,
	helpText: undefined,
});

const emit = defineEmits<{
	(ev: 'update:modelValue', v: boolean): void;
}>();

const checked = computed(() => unref(props.modelValue));
const disabled = computed(() => unref(props.disabled));

const onKeydown = filterKeyboardEnterOrSpace(() => toggle());

const toggle = () => {
	if (disabled.value) return;
	emit('update:modelValue', !checked.value);
};
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: flex;
	user-select: none;

	&:focus-visible {
		outline-offset: 2px;
	}

	&.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.body {
	margin-left: 12px;
	margin-top: 2px;
	display: block;
	transition: inherit;
	color: var(--MI_THEME-fg);
}

.label {
	display: block;
	line-height: 20px;
	cursor: pointer;
	transition: inherit;
}

.caption {
	margin: 8px 0 0 0;
	color: var(--MI_THEME-fgTransparentWeak);
	font-size: 0.85em;

	&:empty {
		display: none;
	}
}

.help {
	margin-left: 0.5em;
	font-size: 85%;
	vertical-align: top;
}
</style>
