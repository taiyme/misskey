<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkButton rounded full small @click="toggle"><b>{{ modelValue ? i18n.ts._cw.hide : i18n.ts._cw.show }}</b><span v-if="!modelValue && label != null" :class="$style.label">{{ label }}</span></MkButton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import MkButton from '@/components/MkButton.vue';
import type { PollEditorModelValue } from '@/components/MkPollEditor.vue';

const props = defineProps<{
	text?: string | null;
	renote?: Misskey.entities.Note | string | null;
	files?: Misskey.entities.DriveFile[] | string[] | null;
	poll?: NonNullable<Misskey.entities.Note['poll']> | PollEditorModelValue | null;
}>();

const modelValue = defineModel<boolean>({ required: true });

const label = computed(() => {
	const list: string[] = [];

	// text
	if (props.text != null && props.text !== '') {
		list.push(i18n.tsx._cw.chars({ count: props.text.length }));
	}
	// renote
	if (props.renote != null) {
		list.push(i18n.ts.quote);
	}
	// files
	if (props.files != null && props.files.length !== 0) {
		list.push(i18n.tsx._cw.files({ count: props.files.length }));
	}
	// poll
	if (props.poll != null) {
		list.push(i18n.ts.poll);
	}

	if (list.length === 0) return null;
	return list.join(' / ');
});

const toggle = (): void => {
	modelValue.value = !modelValue.value;
};
</script>

<style lang="scss" module>
.label {
	margin-left: 4px;

	&::before {
		content: '(';
	}

	&::after {
		content: ')';
	}
}
</style>
