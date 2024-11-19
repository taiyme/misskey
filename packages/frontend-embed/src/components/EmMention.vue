<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<EmA
	:class="$style.root"
	:to="userPageUrlRef"
>
	<img :class="$style.icon" :src="avatarUrlRef" alt="">
	<span :class="$style.acct">
		<span>@{{ username }}</span>
		<span v-if="showHostRef" :class="$style.host">@{{ toUnicode(host) }}</span>
	</span>
</EmA>
</template>

<script lang="ts" setup>
import { toASCII, toUnicode } from 'punycode';
import { computed } from 'vue';
import { host as localHost, url } from '@@/js/config.js';
import EmA from '@/components/EmA.vue';

const props = defineProps<{
	username: string;
	host: string;
}>();

const canonicalRef = computed(() => {
	if (toASCII(props.host) === toASCII(localHost)) {
		return `@${props.username}`;
	}
	return `@${props.username}@${toUnicode(props.host)}`;
});

const showHostRef = computed(() => {
	return (toASCII(props.host) !== toASCII(localHost));
});

const userPageUrlRef = computed(() => {
	return `${url}/${canonicalRef.value}`;
});

const avatarUrlRef = computed(() => {
	return `${url}/avatar/@${props.username}@${toASCII(props.host)}`;
});
</script>

<style lang="scss" module>
.root {
	box-sizing: border-box;
	display: inline-flex;
	max-width: 100%;
	gap: 0.2em;
	align-items: center;
	vertical-align: middle;
	padding: 4px 8px 4px 4px;
	border-radius: 999px;
	color: var(--MI_THEME-mention);
	background: rgb(from var(--MI_THEME-mention) r g b / 0.1);

	&.isMe {
		color: var(--MI_THEME-mentionMe);
		background: rgb(from var(--MI_THEME-mentionMe) r g b / 0.1);
	}
}

.icon {
	width: 1.5em;
	height: 1.5em;
	object-fit: cover;
	border-radius: 100%;
}

.acct {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.host {
	opacity: 0.5;
}
</style>
