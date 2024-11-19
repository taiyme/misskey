<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root" :style="tickerColorsRef">
	<img :class="$style.icon" :src="tickerInfoRef.iconUrl"/>
	<div :class="$style.name">{{ tickerInfoRef.name }}</div>
</div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { host, url } from '@@/js/config.js';
import { DI } from '@/di.js';

const serverMetadata = inject(DI.serverMetadata)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

const mediaProxy = inject(DI.mediaProxy)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

const props = defineProps<{
	instance?: {
		name?: string | null;
		faviconUrl?: string | null;
		themeColor?: string | null;
	} | null;
	channel?: {
		name: string;
		color: string;
	} | null;
}>();

//#region color
type RGB = {
	readonly r: number;
	readonly g: number;
	readonly b: number;
};

const DEFAULT_RGB = { r: 255, g: 0, b: 0 } as const satisfies RGB;

const hexToRgb = (hex: string) => {
	if (hex.startsWith('#')) {
		// eslint-disable-next-line no-param-reassign
		hex = hex.slice(1);
	}
	if (hex.length === 3) {
		if (!validHex(hex)) {
			return { ...DEFAULT_RGB } as const satisfies RGB;
		}
		// eslint-disable-next-line no-param-reassign
		hex = [...hex].map(char => char.repeat(2)).join('');
	}
	if (!(hex.length === 6 && validHex(hex))) {
		return { ...DEFAULT_RGB } as const satisfies RGB;
	}
	const [r, g, b] = Array.from(hex.match(/.{2}/g) ?? [], n => parseInt(n, 16));
	return { r, g, b } as const satisfies RGB;
};

const validHex = (hex: unknown): hex is string => {
	if (typeof hex !== 'string') return false;
	return /^[0-9a-f]+$/i.test(hex);
};
//#endregion

//#region ticker
const TICKER_BG_COLOR_DEFAULT = '#777777' as const;
const TICKER_YUV_THRESHOLD = 191 as const;
const TICKER_FG_COLOR_LIGHT = '#ffffff' as const;
const TICKER_FG_COLOR_DARK = '#2f2f2fcc' as const;

const tickerInfoRef = computed(() => {
	if (props.channel != null) {
		return {
			name: props.channel.name,
			iconUrl: mediaProxy.getProxiedImageUrlNullable(serverMetadata.iconUrl, 'preview') ?? `${url}/favicon.ico`,
			themeColor: props.channel.color,
		} as const;
	}
	if (props.instance != null) {
		return {
			name: props.instance.name ?? '',
			iconUrl: mediaProxy.getProxiedImageUrlNullable(props.instance.faviconUrl, 'preview') ?? '/client-assets/dummy.png',
			themeColor: props.instance.themeColor ?? TICKER_BG_COLOR_DEFAULT,
		} as const;
	}
	return {
		name: serverMetadata.name ?? host,
		iconUrl: mediaProxy.getProxiedImageUrlNullable(serverMetadata.iconUrl, 'preview') ?? `${url}/favicon.ico`,
		themeColor: serverMetadata.themeColor ?? document.querySelector<HTMLMetaElement>('meta[name="theme-color-orig"]')?.content ?? TICKER_BG_COLOR_DEFAULT,
	} as const;
});

const tickerColorsRef = computed(() => {
	const bgHex = tickerInfoRef.value.themeColor;

	const { r, g, b } = hexToRgb(bgHex);
	const yuv = 0.299 * r + 0.587 * g + 0.114 * b;
	const fgHex = yuv > TICKER_YUV_THRESHOLD ? TICKER_FG_COLOR_DARK : TICKER_FG_COLOR_LIGHT;

	return {
		'--ticker-fg': fgHex,
		'--ticker-bg': bgHex,
	} as const;
});
//#endregion
</script>

<style lang="scss" module>
.root {
	overflow: clip;
	box-sizing: border-box;
	background-color: var(--ticker-bg, #777);
	color: var(--ticker-fg, #fff);
	display: grid;
	align-items: center;
	grid-template: 2ex / 2ex 1fr;
	gap: 4px;
	border-radius: 4px;
}

.icon {
	display: block;
	aspect-ratio: 1 / 1;
	box-sizing: border-box;
	width: 2ex;
	height: 2ex;
}

.name {
	display: block;
	font-size: 0.9em;
	font-weight: bold;
	box-sizing: border-box;
	line-height: 2ex;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
