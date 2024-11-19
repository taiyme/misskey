<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<a
		:href="notePage(appearNote)"
		:class="{
			[$style.root]: true,
			[$style.rootVisible]: !videoRef.isSensitive,
		}"
		target="_blank"
		rel="noopener"
		tabindex="0"
	>
		<template v-if="videoRef.isSensitive">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveVideo }}
					</div>
				</div>
			</div>
		</template>

		<template v-else>
			<img v-if="videoRef.thumbnailUrl" :class="$style.videoThumbnail" :src="videoRef.thumbnailUrl" alt=""/>

			<div :class="$style.videoOverlayPlayButton"><i class="ti ti-player-play-filled"></i></div>

			<!-- <div :class="$style.controlsUpperRight">
			</div> -->

			<!-- <div :class="$style.controlsLowerRight">
			</div> -->

			<div :class="$style.controlsLowerLeft">
				<button
					v-if="videoRef.comment"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
				>
					<div :class="$style.controlButton"><span>ALT</span></div>
				</button>
			</div>

			<div :class="$style.controlsUpperLeft">
				<button
					v-if="videoRef.isSensitive"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
				>
					<div :class="$style.controlButton"><span>NSFW</span></div>
				</button>
			</div>
		</template>
	</a>
</div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import type * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import { DI } from '@/di.js';
import { notePage } from '@/utils.js';

const appearNote = inject(DI.appearNote)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

const props = defineProps<{
	video: Misskey.entities.DriveFile;
}>();

const videoRef = computed(() => props.video);
</script>

<style lang="scss" module>
.cq {
	container: mediaVideo / inline-size;
}

.root {
	--mediaVideo-scale: 1;
	box-sizing: border-box;
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	overflow: clip;
	border-radius: var(--mediaList-radius, 8px);
	aspect-ratio: 16 / 9;

	&:focus-visible {
		outline: none;
	}

	&:hover {
		text-decoration: none;
	}
}

.rootVisible {
	background-color: var(--MI_THEME-bg);
	background-image: repeating-linear-gradient(
		135deg,
		transparent 0px 10px,
		var(--c) 6px 16px
	);

	&,
	html[data-color-scheme=light] & {
		--c: color-mix(in srgb, #000000 3.75%, var(--MI_THEME-bg));
	}

	html[data-color-scheme=dark] & {
		--c: color-mix(in srgb, #ffffff 7.5%, var(--MI_THEME-bg));
	}
}

.videoThumbnail {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.videoOverlayPlayButton {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: var(--MI_THEME-accent);
	color: #fff;
	padding: 1rem;
	border-radius: 99rem;
	font-size: 1.1rem;
}

.hideInfo {
	aspect-ratio: 16 / 9;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #777;
	cursor: pointer;

	> .hideInfoItem {
		max-width: 100%;
	}
}

%HideInfoText {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: clamp(6px, calc(12px * var(--mediaVideo-scale)), 12px);
	color: #fff;
}

.hideInfoTitle {
	@extend %HideInfoText;
	font-weight: 700;
}

.hideInfoText {
	@extend %HideInfoText;
}

%Controls {
	position: absolute;
	inset: auto;
	display: flex;

	&:empty {
		display: none;
	}
}

%ControlItem {
	text-align: center;
	font-size: clamp(6px, calc(12px * var(--mediaVideo-scale)), 12px);
	padding:
		clamp(3px, calc(6px * var(--mediaVideo-scale)), 6px)
		clamp(2px, calc(4px * var(--mediaVideo-scale)), 4px);

	&:first-child {
		padding-left: clamp(4px, calc(8px * var(--mediaVideo-scale)), 8px);
	}

	&:last-child {
		padding-right: clamp(4px, calc(8px * var(--mediaVideo-scale)), 8px);
	}

	&:focus-visible {
		outline: none;
	}
}

// .controlsUpperRight {
// 	@extend %Controls;
// 	top: 0;
// 	right: 0;

// 	> .controlItem {
// 		@extend %ControlItem;
// 		padding-bottom: 0;

// 		&:first-child {
// 			padding-left: 0;
// 		}
// 	}
// }

// .controlsLowerRight {
// 	@extend %Controls;
// 	right: 0;
// 	bottom: 0;

// 	> .controlItem {
// 		@extend %ControlItem;
// 		padding-top: 0;

// 		&:first-child {
// 			padding-left: 0;
// 		}
// 	}
// }

.controlsLowerLeft {
	@extend %Controls;
	bottom: 0;
	left: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-top: 0;

		&:last-child {
			padding-right: 0;
		}
	}
}

.controlsUpperLeft {
	@extend %Controls;
	top: 0;
	left: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-bottom: 0;

		&:last-child {
			padding-right: 0;
		}
	}
}

.controlButton {
	display: block;
	border-radius: clamp(3px, calc(6px * var(--mediaVideo-scale)), 6px);
	padding:
		clamp(3px, calc(6px * var(--mediaVideo-scale)), 6px)
		clamp(4px, calc(8px * var(--mediaVideo-scale)), 8px);
	background-color: rgb(0 0 0 / 50%);
	color: #fff;
}

@container mediaVideo (max-width: 250px) {
	.root {
		--mediaVideo-scale: 0.90;
	}
}

@container mediaVideo (max-width: 200px) {
	.root {
		--mediaVideo-scale: 0.85;
	}
}

@container mediaVideo (max-width: 150px) {
	.root {
		--mediaVideo-scale: 0.80;
	}
}

@container mediaVideo (max-width: 130px) {
	.root {
		--mediaVideo-scale: 0.75;
	}
}

@container mediaVideo (max-width: 120px) {
	.root {
		--mediaVideo-scale: 0.70;
	}
}

@container mediaVideo (max-width: 110px) {
	.root {
		--mediaVideo-scale: 0.65;
	}
}

@container mediaVideo (max-width: 100px) {
	.root {
		--mediaVideo-scale: 0.60;
	}

	.controlsLowerLeft {
		display: none;
	}

	.controlsUpperLeft {
		display: none;
	}
}
</style>
