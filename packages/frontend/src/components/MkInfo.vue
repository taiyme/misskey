<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.warn]: warn }]">
	<i v-if="warn" class="ti ti-alert-triangle"></i>
	<i v-else class="ti ti-info-circle"></i>
	<div>
		<slot></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
defineProps<{
	warn?: boolean;
}>();
</script>

<style lang="scss" module>
.root {
	padding: 12px 14px;
	font-size: 90%;
	background: var(--infoBg);
	color: var(--infoFg);
	border-radius: var(--radius);
	white-space: pre-wrap;
	display: flex;
	align-items: center;
	gap: 4px;

	&.warn {
		background: var(--infoWarnBg);
		color: var(--infoWarnFg);
	}
}
</style>
