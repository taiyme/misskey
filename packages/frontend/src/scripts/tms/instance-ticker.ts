/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { host } from '@/config.js';
import { instance as localInstance } from '@/instance.js';
import { getProxiedImageUrlNullable } from '@/scripts/media-proxy.js';
import { type HEX, hexToRgb } from '@/scripts/tms/color.js';
import { type TickerProps } from '@/components/TmsInstanceTicker.vue';

//#region ticker info
type TickerInfo = {
	readonly name: string;
	readonly iconUrl: string;
	readonly themeColor: string;
};

const TICKER_BG_COLOR_DEFAULT = '#777777' as const;

export const getTickerInfo = (props: TickerProps): TickerInfo => {
	if (props.channel != null) {
		return {
			name: props.channel.name,
			iconUrl: getProxiedImageUrlNullable(localInstance.iconUrl, 'preview') ?? '/favicon.ico',
			themeColor: props.channel.color,
		} as const satisfies TickerInfo;
	}
	if (props.instance != null) {
		return {
			name: props.instance.name ?? '',
			// NOTE: リモートサーバーにおいてiconUrlを参照すると意図した画像にならない https://github.com/taiyme/misskey/issues/210
			iconUrl: getProxiedImageUrlNullable(props.instance.faviconUrl, 'preview') ?? '/client-assets/dummy.png',
			themeColor: props.instance.themeColor ?? TICKER_BG_COLOR_DEFAULT,
		} as const satisfies TickerInfo;
	}
	return {
		name: localInstance.name ?? host,
		iconUrl: getProxiedImageUrlNullable(localInstance.iconUrl, 'preview') ?? '/favicon.ico',
		themeColor: localInstance.themeColor ?? document.querySelector<HTMLMetaElement>('meta[name="theme-color-orig"]')?.content ?? TICKER_BG_COLOR_DEFAULT,
	} as const satisfies TickerInfo;
};
//#endregion ticker info

//#region ticker colors
type TickerColors = {
	readonly '--ticker-bg': string;
	readonly '--ticker-fg': string;
	readonly '--ticker-bg-rgb': string;
};

const TICKER_YUV_THRESHOLD = 191 as const;
const TICKER_FG_COLOR_LIGHT = '#ffffff' as const;
const TICKER_FG_COLOR_DARK = '#2f2f2fcc' as const;

const tickerColorsCache = new Map<HEX, TickerColors>();

export const getTickerColors = (info: TickerInfo): TickerColors => {
	const bgHex = info.themeColor;
	const cachedTickerColors = tickerColorsCache.get(bgHex);
	if (cachedTickerColors != null) return cachedTickerColors;

	const { r, g, b } = hexToRgb(bgHex);
	const yuv = 0.299 * r + 0.587 * g + 0.114 * b;
	const fgHex = yuv > TICKER_YUV_THRESHOLD ? TICKER_FG_COLOR_DARK : TICKER_FG_COLOR_LIGHT;

	const tickerColors = {
		'--ticker-fg': fgHex,
		'--ticker-bg': bgHex,
		'--ticker-bg-rgb': `${r}, ${g}, ${b}`,
	} as const satisfies TickerColors;

	tickerColorsCache.set(bgHex, tickerColors);

	return tickerColors;
};
//#endregion ticker colors

//#region ticker state
type TickerState = {
	readonly normal: boolean;
	readonly vertical: boolean;
	readonly watermark: boolean;
	readonly left: boolean;
	readonly right: boolean;
};

export const getTickerState = (props: TickerProps): TickerState => {
	const vertical = props.position === 'leftVerticalBar' || props.position === 'rightVerticalBar';
	const watermark = props.position === 'leftWatermark' || props.position === 'rightWatermark';
	const normal = !vertical && !watermark;
	const left = props.position === 'leftVerticalBar' || props.position === 'leftWatermark';
	const right = props.position === 'rightVerticalBar' || props.position === 'rightWatermark';
	return { normal, vertical, watermark, left, right } as const satisfies TickerState;
};
//#endregion ticker state
