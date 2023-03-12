<template>
<div class="hpaizdrt" :class="{ vertical }" :style="tickerColor">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<span class="name">{{ instance.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';
import { tmsStore } from '@/tms/store';

const props = defineProps<{
	instance?: {
		faviconUrl?: string;
		name: string;
		themeColor?: string;
	};
	vertical?: boolean;
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: Instance.iconUrl || Instance.faviconUrl || '/favicon.ico',
	name: instanceName,
	themeColor: (document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement)?.content,
};

const vertical =
	tmsStore.state.verticalInstanceTicker && (props.vertical || false);

const yuvColor = (hex) => {
	const toRgb = (hex) => {
		const [r, g, b] = Array.from(hex.slice(1).match(/.{2}/g) || [], (n) => parseInt(n, 16));
		return { r, g, b };
	};

	const { r, g, b } = toRgb(hex);
	const yuv = 0.299 * r + 0.587 * g + 0.114 * b;

	return yuv > 191 ? '#2f2f2fcc' : '#ffffff';
};

const tickerBgColor = instance.themeColor ?? '#777777';
const tickerFgColor = yuvColor(tickerBgColor);

const tickerColor = {
	'--ticker-bg': tickerBgColor,
	'--ticker-fg': tickerFgColor,
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	background: var(--ticker-bg, #777777);
	color: var(--ticker-fg, #ffffff);
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
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
	}

	&.vertical {
		position: absolute;
		top: 0;
		left: 0;
		width: 14px;
		height: 100%;
		border-radius: 0;

		> .icon {
			width: 100%;
			height: auto;
		}

		> .name {
			display: inline-block;
			height: calc(100% - 14px);
			margin-left: 0;
			line-height: 14px;
			writing-mode: vertical-lr;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}
}
</style>
