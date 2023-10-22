<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-size="{ max: [250, 150], min: [] }"
	:class="{
		[$style.root]: true,
		[$style.hidden]: hide,
		[$style.visible]: !hide,
		[$style.sensitive]: sensitive,
	}"
	:style="{
		'--c': (
			defaultStore.reactiveState.darkMode.value
				? 'rgba(255, 255, 255, 0.02)'
				: 'rgba(0, 0, 0, 0.02)'
		),
	}"
	@click="onClick"
>
	<div
		:title="video.name"
		:class="$style.videoContainer"
		style="aspect-ratio: 16 / 9;"
	>
		<video
			v-if="!hide"
			ref="videoEl"
			:class="$style.video"
			:poster="video.thumbnailUrl"
			:alt="video.comment || video.name"
			:title="video.comment || video.name"
			preload="none"
			:controls="controls"
			@contextmenu.stop="() => {}"
		>
			<source :src="video.url"/>
		</video>
		<div v-else :class="[$style.video, $style.sensitiveBg]"></div>
	</div>
	<template v-if="hide">
		<div :class="['_noSelect', $style.hiddenText]">
			<div :class="$style.hiddenTextWrapper">
				<b v-if="video.isSensitive" style="display: block;">
					<i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ defaultStore.state.enableDataSaverMode ? ` (${i18n.ts.video}${video.size ? ` ${bytes(video.size)}` : ''})` : '' }}
				</b>
				<b v-else style="display: block;">
					<i class="ti ti-movie"></i> {{ defaultStore.state.enableDataSaverMode && video.size ? bytes(video.size) : i18n.ts.video }}
				</b>
				<span v-if="controls" style="display: block;">{{ i18n.ts.clickToShow }}</span>
			</div>
		</div>
	</template>
	<template v-else-if="controls">
		<button v-tooltip="i18n.ts.hide" :class="['_button', $style.hide]" @click.stop="hide = true">
			<div :class="$style.hideInner"><i class="ti ti-eye-off" style="display: block;"></i></div>
		</button>
		<div :class="$style.indicators" @click.stop="() => {}">
			<button v-if="video.comment" v-tooltip:dialog="video.comment" :class="['_button', $style.indicator]">ALT</button>
			<button v-if="video.isSensitive" v-tooltip:dialog="i18n.ts._tms.sensitiveInfo" :class="['_button', $style.indicator]">NSFW</button>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue';
import type * as Misskey from 'misskey-js';
import bytes from '@/filters/bytes.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';

const props = withDefaults(defineProps<{
	video: Misskey.entities.DriveFile;
	controls?: boolean;
}>(), {
	controls: true,
});

const videoEl = shallowRef<HTMLVideoElement | null>(null);

watch(videoEl, () => {
	if (videoEl.value) {
		videoEl.value.volume = 0.3;
	}
});

const hide = ref(true);
const sensitive = ref(false);

watch(() => props.video, () => {
	hide.value = (defaultStore.state.nsfw === 'force' || defaultStore.state.enableDataSaverMode) || (props.video.isSensitive && defaultStore.state.nsfw !== 'ignore');
	sensitive.value = (props.video.isSensitive && defaultStore.state.highlightSensitiveMedia);
}, {
	deep: true,
	immediate: true,
});

const onClick = (): void => {
	if (!props.controls) return;
	if (hide.value) {
		hide.value = false;
	}
};
</script>

<style lang="scss" module>
.root {
	--gap: 8px;
}

.hidden {
	position: relative;
}

.sensitive {
	position: relative;

	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: inherit;
		box-shadow: inset 0 0 0 4px var(--warn);
	}
}

.hiddenText {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.hiddenTextWrapper {
	display: table-cell;
	text-align: center;
	font-size: 0.8em;
	color: #fff;
}

.visible {
	position: relative;
	// box-shadow: 0 0 0 1px var(--divider) inset;
	background: var(--bg);
	background-image: linear-gradient(
		45deg,
		var(--c) 16.67%,
		var(--bg) 16.67%,
		var(--bg) 50%,
		var(--c) 50%,
		var(--c) 66.67%,
		var(--bg) 66.67%,
		var(--bg) 100%
	);
	background-size: 16px 16px;
}

%ButtonContainer {
	position: absolute;
	top: auto;
	right: auto;
	bottom: auto;
	left: auto;
	display: flex;
	gap: calc(var(--gap, 8px) * 0.75);
	padding: var(--gap, 8px);
	font-size: 0.8em;
	text-align: center;

	&:empty {
		display: none;
	}
}

%ButtonInner {
	display: block;
	border-radius: 6px;
	background-color: rgba(0, 0, 0, 0.3);
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	color: #fff;
	padding: calc(var(--gap, 8px) * 0.75) var(--gap, 8px);

	&:empty {
		display: none;
	}
}

.hide {
	@extend %ButtonContainer;
	top: 0;
	right: 0;
}

.hideInner {
	@extend %ButtonInner;
}

.indicators {
	@extend %ButtonContainer;
	top: 0;
	left: 0;
}

.indicator {
	@extend %ButtonInner;
	font-weight: bold;
}

:global(:where(.max-width_250px)) {
	&.root {
		--gap: 6px;
	}
}

:global(:where(.max-width_150px)) {
	&.root {
		--gap: 4px;
	}

	&:where(.root) {
		.hide {
			display: none;
		}

		.indicators {
			display: none;
		}
	}
}

.videoContainer {
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
}

.video {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 3.5em;
	overflow: hidden;
	background-position: center;
	background-size: cover;
	width: 100%;
	height: 100%;
}

.sensitiveBg {
	background-color: rgba(0, 0, 0, 0.8);
}
</style>
