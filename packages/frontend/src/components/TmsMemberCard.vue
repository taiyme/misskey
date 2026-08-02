<!--
SPDX-FileCopyrightText: Copyright (c) 2026 taiy, <https://taiy.me/>
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<a
	:class="[$style.root, '_noSelect']"
	:href="props.href"
	target="_blank"
	rel="nofollow noopener"
>
	<img :class="[$style.icon, '_ghost']" :src="props.iconUrl" alt=""/>
	<span :class="$style.name">{{ props.name }}</span>
</a>
</template>

<script lang="ts" setup>
const props = defineProps<{
	name: string;
	href: string;
	iconUrl: string;
}>();
</script>

<style lang="scss" module>
.root {
	display: flex;
	align-items: center;
	padding: 12px;
	gap: 12px;
	background: var(--MI_THEME-buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--MI_THEME-buttonHoverBg);
	}
}

.icon {
	width: 30px;
	border-radius: 100%;
}

.name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
