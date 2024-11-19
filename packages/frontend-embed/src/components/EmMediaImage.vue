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
			[$style.rootVisible]: !imageRef.isSensitive,
		}"
		target="_blank"
		rel="noopener"
		tabindex="0"
	>
		<div
			:title="imageRef.name"
			:class="$style.imageContainer"
		>
			<EmImgWithBlurhash
				:hash="imageRef.blurhash"
				:src="imageRef.isSensitive ? null : imageUrlRef"
				:forceBlurhash="imageRef.isSensitive"
				:cover="imageRef.isSensitive || props.cover"
				:alt="imageRef.comment || imageRef.name"
				:title="imageRef.comment || imageRef.name"
				:width="imageRef.properties.width"
				:height="imageRef.properties.height"
				:style="imageRef.isSensitive ? 'filter: brightness(0.7);' : undefined"
			/>
		</div>

		<template v-if="imageRef.isSensitive">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveImage }}
					</div>
				</div>
			</div>
		</template>

		<template v-else>
			<!-- <div :class="$style.controlsUpperRight">
			</div> -->

			<!-- <div :class="$style.controlsLowerRight">
			</div> -->

			<div :class="$style.controlsLowerLeft">
				<button
					v-if="imageRef.comment"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
				>
					<div :class="$style.controlButton"><span>ALT</span></div>
				</button>
			</div>

			<div :class="$style.controlsUpperLeft">
				<button
					v-if="['image/gif', 'image/apng'].includes(imageRef.type)"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
				>
					<div :class="$style.controlButton"><span>GIF</span></div>
				</button>
				<button
					v-if="imageRef.isSensitive"
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
import EmImgWithBlurhash from '@/components/EmImgWithBlurhash.vue';
import { DI } from '@/di.js';
import { notePage } from '@/utils.js';

const appearNote = inject(DI.appearNote)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

const props = defineProps<{
	image: Misskey.entities.DriveFile;
	raw?: boolean;
	cover?: boolean;
}>();

const imageRef = computed(() => props.image);

const imageUrlRef = computed(() => {
	if (props.raw) {
		return imageRef.value.url;
	}
	return imageRef.value.thumbnailUrl;
});
</script>

<style lang="scss" module>
.cq {
	container: mediaImage / inline-size;
}

.root {
	--mediaImage-scale: 1;
	box-sizing: border-box;
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	overflow: clip;
	border-radius: var(--mediaList-radius, 8px);

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

.hideInfo {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	cursor: pointer;

	> .hideInfoItem {
		max-width: 100%;
	}
}

%HideInfoText {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: clamp(6px, calc(12px * var(--mediaImage-scale)), 12px);
	color: #fff;
}

.hideInfoTitle {
	@extend %HideInfoText;
	font-weight: 700;
}

.hideInfoText {
	@extend %HideInfoText;
}

.imageContainer {
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
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
	font-size: clamp(6px, calc(12px * var(--mediaImage-scale)), 12px);
	padding:
		clamp(3px, calc(6px * var(--mediaImage-scale)), 6px)
		clamp(2px, calc(4px * var(--mediaImage-scale)), 4px);

	&:first-child {
		padding-left: clamp(4px, calc(8px * var(--mediaImage-scale)), 8px);
	}

	&:last-child {
		padding-right: clamp(4px, calc(8px * var(--mediaImage-scale)), 8px);
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
	border-radius: clamp(3px, calc(6px * var(--mediaImage-scale)), 6px);
	padding:
		clamp(3px, calc(6px * var(--mediaImage-scale)), 6px)
		clamp(4px, calc(8px * var(--mediaImage-scale)), 8px);
	background-color: rgb(0 0 0 / 50%);
	color: #fff;
}

@container mediaImage (max-width: 250px) {
	.root {
		--mediaImage-scale: 0.90;
	}
}

@container mediaImage (max-width: 200px) {
	.root {
		--mediaImage-scale: 0.85;
	}
}

@container mediaImage (max-width: 150px) {
	.root {
		--mediaImage-scale: 0.80;
	}
}

@container mediaImage (max-width: 130px) {
	.root {
		--mediaImage-scale: 0.75;
	}
}

@container mediaImage (max-width: 120px) {
	.root {
		--mediaImage-scale: 0.70;
	}
}

@container mediaImage (max-width: 110px) {
	.root {
		--mediaImage-scale: 0.65;
	}
}

@container mediaImage (max-width: 100px) {
	.root {
		--mediaImage-scale: 0.60;
	}

	.controlsLowerLeft {
		display: none;
	}

	.controlsUpperLeft {
		display: none;
	}
}
</style>
