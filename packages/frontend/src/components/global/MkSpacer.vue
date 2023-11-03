<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-size="{ max: [450], min: [451] }" :class="[$style.root, { [$style.rootMin]: forceSpacerMin }]">
	<div v-container="{ type: 'inlineSize' }" :class="$style.content">
		<slot></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { deviceKind } from '@/scripts/device-kind.js';

const props = withDefaults(defineProps<{
	contentMax?: number | null;
	marginMin?: number;
	marginMax?: number;
}>(), {
	contentMax: null,
	marginMin: 12,
	marginMax: 24,
});

const forceSpacerMin = inject('forceSpacerMin', false) || deviceKind === 'smartphone';
</script>

<style lang="scss" module>
.root {
	box-sizing: border-box;
	width: 100%;
}
.rootMin {
	padding: v-bind('props.marginMin + "px"') !important;
}

.content {
	margin: 0 auto;
	max-width: v-bind('props.contentMax + "px"');
	container-type: inline-size;
}

:global(:where(.max-width_450px)) {
	&.root {
		padding: v-bind('props.marginMin + "px"');
	}
}

:global(:where(.min-width_451px)) {
	&.root {
		padding: v-bind('props.marginMax + "px"');
	}
}
</style>
