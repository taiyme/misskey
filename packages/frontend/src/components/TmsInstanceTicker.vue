<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="{
		[$style.root]: true,
		[$style.normalRoot]: tickerStateRef.normal,
		[$style.verticalRoot]: tickerStateRef.vertical,
		[$style.watermarkRoot]: tickerStateRef.watermark,
		[$style.left]: tickerStateRef.left,
		[$style.right]: tickerStateRef.right,
	}"
	:style="tickerColorsRef"
>
	<img :class="$style.icon" :src="tickerInfoRef.iconUrl"/>
	<div :class="$style.name">{{ tickerInfoRef.name }}</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import {
	type TmsInstanceTickerProps,
	getTickerColors,
	getTickerInfo,
	getTickerState,
} from '@/components/TmsInstanceTicker.impl.js';

const props = defineProps<TmsInstanceTickerProps>();

const tickerInfoRef = computed(() => getTickerInfo(props));
const tickerColorsRef = computed(() => getTickerColors(tickerInfoRef.value));
const tickerStateRef = computed(() => getTickerState(props));
</script>

<style lang="scss" module>
//#region 共通
.root {
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	display: block;
	box-sizing: border-box;
	background-color: var(--ticker-bg, #777);
	color: var(--ticker-fg, #fff);
}

.icon {
	display: block;
	aspect-ratio: 1 / 1;
	box-sizing: border-box;
}

.name {
	display: block;
	font-size: 0.9em;
	font-weight: bold;
	box-sizing: border-box;
}
//#endregion 共通

//#region 通常
.normalRoot {
	--ticker-size: 2ex;
	display: grid;
	align-items: center;
	grid-template: var(--ticker-size) / var(--ticker-size) 1fr;
	gap: 4px;
	border-radius: 4px;

	> .icon {
		width: var(--ticker-size);
		height: var(--ticker-size);
	}

	> .name {
		line-height: var(--ticker-size);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
//#endregion 通常

//#region 縦
.verticalRoot {
	--ticker-size: 2ex;
	position: absolute;
	top: 0;
	bottom: 0;
	display: grid;
	justify-items: center;
	grid-template: var(--ticker-size) 1fr / var(--ticker-size);
	gap: 4px;

	&.left {
		left: 0;
	}

	&.right {
		right: 0;
	}

	> .icon {
		width: var(--ticker-size);
		height: var(--ticker-size);
	}

	> .name {
		writing-mode: vertical-lr;
		line-height: var(--ticker-size);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
//#endregion 縦

//#region 透かし
.watermarkRoot {
	pointer-events: none;
	-webkit-user-select: none;
	user-select: none;
	position: absolute;
	z-index: -1;
	inset: 0;
	padding: 6px;
	display: flex;
	gap: 4px;
	flex-direction: column;
	justify-content: flex-end;
	background: linear-gradient(
		var(--ticker-bg-deg),
		rgba(0, 0, 0, 0) calc(100% - 3em),
		color(from var(--ticker-bg, #777) srgb r g b / 0.35) calc(100% - 3em),
		color(from var(--ticker-bg, #777) srgb r g b / 0.35) 100%
	);
	color: #fff;
	text-shadow: /* 0.866 ≈ sin(60deg) */
		1px 0 1px #000,
		0.866px 0.5px 1px #000,
		0.5px 0.866px 1px #000,
		0 1px 1px #000,
		-0.5px 0.866px 1px #000,
		-0.866px 0.5px 1px #000,
		-1px 0 1px #000,
		-0.866px -0.5px 1px #000,
		-0.5px -0.866px 1px #000,
		0 -1px 1px #000,
		0.5px -0.866px 1px #000,
		0.866px -0.5px 1px #000;

	&.left {
		--ticker-bg-deg: -135deg;
		align-items: flex-start;

		> .name {
			text-align: start;
		}
	}

	&.right {
		--ticker-bg-deg: 135deg;
		align-items: flex-end;

		> .name {
			text-align: end;
		}
	}

	> .icon {
		width: 1.5em;
		height: 1.5em;
		opacity: 0.8;
	}

	> .name {
		max-width: 100%;
		margin: -4px; // text-shadow
		padding: 4px; // text-shadow
		line-height: 1;
		opacity: 0.7;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
//#endregion 透かし
</style>
