<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA
	v-user-preview="canonicalRef"
	:class="[$style.root, { [$style.isMe]: isMeRef }]"
	:to="userPageUrlRef"
	:behavior="navigationBehavior"
>
	<img :class="$style.icon" :src="avatarUrlRef" alt="">
	<span :class="$style.acct">
		<span>@{{ username }}</span>
		<span v-if="showHostRef" :class="$style.host">@{{ toUnicode(host) }}</span>
	</span>
</MkA>
</template>

<script lang="ts" setup>
import { toASCII, toUnicode } from 'punycode';
import { computed } from 'vue';
import { host as localHost } from '@@/js/config.js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { type MkABehavior } from '@/components/global/MkA.vue';

const props = defineProps<{
	username: string;
	host: string;
	navigationBehavior?: MkABehavior;
}>();

const canonicalRef = computed(() => {
	if (toASCII(props.host) === toASCII(localHost)) {
		return `@${props.username}`;
	}
	return `@${props.username}@${toUnicode(props.host)}`;
});

const isMeRef = computed(() => {
	if ($i == null) return false;
	return canonicalRef.value.toLowerCase() === `@${$i.username}`.toLowerCase();
});

const showHostRef = computed(() => {
	return (toASCII(props.host) !== toASCII(localHost)) || defaultStore.reactiveState.showFullAcct.value;
});

const userPageUrlRef = computed(() => {
	return `/${canonicalRef.value}`;
});

const avatarUrlRef = computed(() => {
	if (defaultStore.state.disableShowingAnimatedImages || defaultStore.state.dataSaver.avatar) {
		return getStaticImageUrl(`/avatar/@${props.username}@${toASCII(props.host)}`);
	}
	return `/avatar/@${props.username}@${toASCII(props.host)}`;
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
	background: color(from var(--MI_THEME-mention) srgb r g b / 0.1);

	&.isMe {
		color: var(--MI_THEME-mentionMe);
		background: color(from var(--MI_THEME-mentionMe) srgb r g b / 0.1);
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
