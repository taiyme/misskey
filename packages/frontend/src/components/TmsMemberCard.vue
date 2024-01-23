<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!-- NOTE: pages/about.vue を参照する -->
<template>
<component
	:is="props.member.href == null ? 'div' : 'a'"
	:class="$style.root"
	v-bind="props.member.href == null ? {} : { href: props.member.href, target: '_blank' }"
>
	<img :class="$style.icon" :src="props.member.iconUrl" alt=""/>
	<span :class="$style.name">{{ props.member.name }}</span>
</component>
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
	background: var(--buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--buttonHoverBg);
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
