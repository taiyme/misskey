<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA v-user-preview="canonical" :class="[$style.root, { [$style.isMe]: isMe }]" :to="url" :style="{ background: bgCss }" :behavior="behavior">
	<img :class="$style.icon" :src="avatarUrl" alt="">
	<span>
		<span>@{{ username }}</span>
		<span v-if="showHostRef" :class="$style.host">@{{ toUnicode(host) }}</span>
	</span>
</MkA>
</template>

<script lang="ts" setup>
import { toASCII, toUnicode } from 'punycode';
import { computed } from 'vue';
import tinycolor from 'tinycolor2';
import { host as localHost } from '@/config.js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { type MkABehavior } from '@/components/global/MkA.vue';

const props = defineProps<{
	username: string;
	host: string;
	behavior?: MkABehavior;
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
	if (defaultStore.state.disableShowingAnimatedImages) {
		return getStaticImageUrl(`/avatar/@${props.username}@${toASCII(props.host)}`);
	}
	return `/avatar/@${props.username}@${toASCII(props.host)}`;
});

const bgColorRef = computed(() => {
	const fgColor = window.getComputedStyle(document.documentElement).getPropertyValue(isMeRef.value ? '--mentionMe' : '--mention');
	return tinycolor(fgColor).setAlpha(0.1).toRgbString();
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
	color: var(--mention);

	&.isMe {
		color: var(--mentionMe);
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
