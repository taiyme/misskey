<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-panel
	:class="[$style.root, { [$style.onOverlay]: serverRef.bannerUrl != null }]"
	:style="{ backgroundImage: serverRef.bannerUrl != null ? `url(${ serverRef.bannerUrl })` : undefined }"
>
	<div :class="$style.bannerInner">
		<img :class="$style.icon" :src="serverRef.iconUrl" :alt="serverRef.name"/>
		<div :class="$style.name">{{ serverRef.name }}</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { host } from '@@/js/config.js';
import { instance } from '@/instance.js';

const serverRef = computed(() => {
	return {
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		name: instance.name || host,
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		iconUrl: instance.iconUrl || '/favicon.ico',
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		bannerUrl: instance.bannerUrl || null,
	} as const;
});
</script>

<style lang="scss" module>
.root {
	overflow: clip;
	border-radius: 10px;
	background-size: cover;
	background-position: center center;

	&.onOverlay {
		-webkit-backdrop-filter: var(--MI-blur, blur(0px)); // https://stackoverflow.com/questions/36378512
		backdrop-filter: var(--MI-blur, blur(0px)); // https://stackoverflow.com/questions/36378512

		.bannerInner {
			background-color: #00000040;
			-webkit-backdrop-filter: var(--MI-blur, blur(2px));
			backdrop-filter: var(--MI-blur, blur(2px));
		}

		.name {
			margin: -6px; // text-shadow
			padding: 6px; // text-shadow
			text-shadow: 0 0 6px #00000050;
			color: #fff;
		}
	}
}

.bannerInner {
	display: flex;
	flex-direction: column;
	gap: 1.5em;
	padding: 16px;
}

.icon {
	display: block;
	margin: 0 auto;
	width: 64px;
	height: 64px;
	border-radius: 8px;
}

.name {
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 700;
	color: var(--MI_THEME-fg);
}
</style>
