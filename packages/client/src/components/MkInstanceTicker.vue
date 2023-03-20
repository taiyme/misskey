<template>
<div class="hpaizdrt" :class="position" :style="tickerColor">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<span class="name">{{ instance.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';
import { tmsStore } from '@/tms/store';

const props = defineProps<{
	instance?: {
		faviconUrl?: string;
		name: string;
		themeColor?: string;
	};
	normal?: boolean;
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: Instance.iconUrl || (Instance as { faviconUrl?: string | null }).faviconUrl || '/favicon.ico',
	name: instanceName,
	themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color-orig"]')?.content,
};

const position = computed(() => {
	if (props.normal) return 'normal';
	return tmsStore.state.instanceTickerPosition;
});

const hexToRgb = (hex: string): {
	r: number;
	g: number;
	b: number;
} => {
	const [r, g, b] = Array.from(hex.slice(1).match(/.{2}/g) ?? [], n => parseInt(n, 16));
	return { r, g, b };
};

const yuvColor = (hex: string): string => {
	const { r, g, b } = hexToRgb(hex);
	const yuv = 0.299 * r + 0.587 * g + 0.114 * b;

	return yuv > 191 ? '#2f2f2fcc' : '#ffffff';
};

const tickerBgColor = instance.themeColor ?? '#777777';
const tickerFgColor = yuvColor(tickerBgColor);

const tickerColor = {
	'--ticker-bg': tickerBgColor,
	'--ticker-fg': tickerFgColor,
	'--ticker-bg-rgb': (({ r, g, b }): string => `${r}, ${g}, ${b}`)(hexToRgb(tickerBgColor)),
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	background: var(--ticker-bg, #777777);
	color: var(--ticker-fg, #ffffff);
	overflow: hidden;

	> .icon {
		aspect-ratio: 1 / 1;
	}

	> .name {
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
	}

	&.normal {
		width: auto;
		height: 1.1rem;
		border-radius: 4px;
		overflow: hidden;

		> .icon {
			width: auto;
			height: 100%;
		}

		> .name {
			margin-left: 4px;
			line-height: 1.1rem;
		}
	}

	&%EdgeBase {
		position: absolute;
		top: 0;
		display: grid;
		gap: 4px;
		grid-template-rows: auto 1fr;
		width: 14px;
		height: 100%;

		> .icon {
			display: block;
			width: 100%;
			aspect-ratio: 1 / 1;
		}

		> .name {
			display: block;
			width: 100%;
			height: 100%;
			line-height: 14px;
			writing-mode: vertical-lr;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}

	&.leftedge {
		@extend %EdgeBase;
		left: 0;
	}

	&.rightedge {
		@extend %EdgeBase;
		right: 0;
	}

	&%BottomBase {
		pointer-events: none;
		position: absolute;
		inset: 0;
		padding: 6px;
		display: flex;
		gap: 4px;
		flex-direction: column;
		justify-content: flex-end;
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

		> .icon {
			display: block;
			height: 2em;
			opacity: 0.8;
		}

		> .name {
			display: block;
			line-height: 1;
			opacity: 0.7;
			white-space: nowrap;
			overflow: visible;
		}
	}

	&.bottomright {
		@extend %BottomBase;
		align-items: flex-end;
		background: linear-gradient(
			125deg,
			rgba(0, 0, 0, 0),
			rgba(0, 0, 0, 0) calc(100% - 5em),
			rgba(var(--ticker-bg-rgb), 0.19) calc(100% - 5em),
			rgba(var(--ticker-bg-rgb), 0.04) 100%
		);

		> .name {
			text-align: end;
		}
	}

	&.bottomleft {
		@extend %BottomBase;
		align-items: flex-start;
		background: linear-gradient(
			-125deg,
			rgba(0, 0, 0, 0),
			rgba(0, 0, 0, 0) calc(100% - 5em),
			rgba(var(--ticker-bg-rgb), 0.19) calc(100% - 5em),
			rgba(var(--ticker-bg-rgb), 0.04) 100%
		);

		> .name {
			text-align: start;
		}
	}
}
</style>
