<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	v-tooltip.noDelay.right="tooltipRef"
	:class="['_button', $style.root]"
	@mousedown.prevent.stop="openInstanceMenu"
	@contextmenu.prevent.stop="openInstanceMenu"
>
	<img
		v-if="props.iconOnly"
		:class="['_ghost', $style.iconOnly]"
		:src="serverRef.iconUrl"
		:alt="serverRef.name"
	/>
	<div
		v-else
		:class="['_ghost', $style.banner, { [$style.onOverlay]: serverRef.bannerUrl != null }]"
		:style="{ backgroundImage: serverRef.bannerUrl != null ? `url(${ serverRef.bannerUrl })` : undefined }"
	>
		<div :class="$style.bannerInner">
			<img :class="$style.icon" :src="serverRef.iconUrl" :alt="serverRef.name"/>
			<div :class="$style.name">{{ serverRef.shortName }}</div>
			<i :class="$style.mark" class="ti ti-chevron-down"></i>
		</div>
	</div>
</button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { host } from '@@/js/config.js';
import { instance } from '@/instance.js';
import { openInstanceMenu } from '@/ui/_common_/common.js';

const props = defineProps<{
	iconOnly?: boolean;
	tooltip?: boolean;
}>();

const serverRef = computed(() => {
	return {
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		name: instance.name || host,
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		shortName: instance.shortName || instance.name || host,
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		iconUrl: instance.iconUrl || '/favicon.ico',
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		bannerUrl: instance.bannerUrl || null,
	} as const;
});

const tooltipRef = computed(() => {
	if (!props.tooltip) return null;
	return serverRef.value.name;
});
</script>

<style lang="scss" module>
.root {
	box-sizing: border-box;
	overflow: clip;
	display: block;
	width: 100%;
	padding: var(--tmsServerLogo-padding, 0);

	&:focus-visible {
		outline: none;

		> .iconOnly,
		> .banner {
			outline: var(--MI_THEME-focus) solid 2px;
			outline-offset: 2px;
		}
	}
}

.iconOnly {
	display: block;
	margin: 0 auto;
	overflow: clip;
	border-radius: 2px;
	width: 30px;
	height: 30px;
}

.banner {
	overflow: clip;
	border-radius: 6px;
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

		.mark {
			text-shadow: 0 0 6px #00000050;
			color: #fff;
		}
	}
}

.bannerInner {
	display: flex;
	align-items: center;
	padding: 8px 0;
}

.icon {
	display: block;
	margin: 0 12px 0 17px;
	width: 24px;
	height: 24px;
	border-radius: 8px;
}

.name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 700;
	color: var(--MI_THEME-fg);
}

.mark {
	display: flex;
	margin: 0 6px 0 auto;
	color: var(--MI_THEME-fg);
}
</style>
