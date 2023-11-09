<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<span
	:class="{
		[$style.root]: true,
		[$style.isOver]: isOver,
	}"
>
	<span>{{ chars }}</span>
	<span v-if="warnText" v-tooltip:dialog="warnText" class="_button" :class="$style.warn"><i class="ti ti-alert-triangle"></i></span>
</span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n.js';
import { type Counter } from '@/scripts/tms/text-counter.js';

const props = defineProps<{
	counter: Counter;
}>();

const isOver = computed(() => {
	return props.counter.hasLimit && props.counter.isOver;
});

const chars = computed(() => {
	if (props.counter.hasLimit) {
		return String(props.counter.maxChars - props.counter.chars);
	}
	return String(props.counter.chars);
});

const warnText = computed(() => {
	if (props.counter.hasLimit && props.counter.isOver) {
		return i18n.t('_dialog.charactersExceeded', {
			current: props.counter.chars,
			max: props.counter.maxChars,
		});
	}
	return '';
});
</script>

<style lang="scss" module>
.root {
	white-space: nowrap;
	opacity: 0.7;

	&.isOver {
		color: var(--error);
	}
}

.warn {
	margin-left: 0.5em;
	font-size: 85%;
	vertical-align: top;
	color: var(--error);
}
</style>
