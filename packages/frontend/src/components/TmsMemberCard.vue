<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<a
	:class="[$style.root, '_noSelect']"
	:href="props.member.href"
	target="_blank"
	rel="nofollow noopener"
>
	<img :class="[$style.icon, '_ghost']" :src="props.member.iconUrl" alt=""/>
	<span :class="$style.name">{{ props.member.name }}</span>
</a>
</template>

<script lang="ts" setup>
import type { Contributor } from '@/tms/contributors.js';

const props = defineProps<{
	member: Contributor;
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
