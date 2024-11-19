<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<code :class="$style.code">{{ code }}</code>
</template>

<script lang="ts" setup>
defineProps<{
	code: string;
}>();
</script>

<style lang="scss" module>
.code {
	display: inline-block;
	font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
	overflow-wrap: anywhere;
	background: var(--MI_THEME-bg);
	padding: 0.1em;
	border-radius: 0.3em;
}
</style>
