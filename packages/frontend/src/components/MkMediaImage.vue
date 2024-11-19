<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<div
		:class="{
			[$style.root]: true,
			[$style.rootVisible]: !hideRef,
			[$style.rootSensitive]: sensitiveRef,
		}"
		tabindex="0"
		@click="showImage"
		@contextmenu.stop="() => {}"
	>
		<component
			:is="props.disableImageLink ? 'div' : 'a'"
			v-bind="props.disableImageLink ? {
				title: imageRef.name,
				class: $style.imageContainer,
			} : {
				title: imageRef.name,
				class: $style.imageContainer,
				href: imageRef.url,
				style: 'cursor: zoom-in;',
			}"
			tabindex="-1"
		>
			<MkImgWithBlurhash
				:hash="imageRef.blurhash"
				:src="(defaultStore.state.dataSaver.media && hideRef) ? null : imageUrlRef"
				:forceBlurhash="hideRef"
				:cover="hideRef || props.cover"
				:alt="imageRef.comment || imageRef.name"
				:title="imageRef.comment || imageRef.name"
				:width="imageRef.properties.width"
				:height="imageRef.properties.height"
				:style="hideRef ? 'filter: brightness(0.7);' : undefined"
			/>
		</component>

		<template v-if="hideRef">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div v-if="imageRef.isSensitive" :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveImage }}
					</div>
					<div v-else :class="$style.hideInfoTitle">
						<i class="ti ti-photo"></i> {{ i18n.ts.image }}
					</div>
				</div>
				<div v-if="defaultStore.state.dataSaver.media && imageRef.size" :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						<i class="ti ti-cloud-download"></i> {{ bytes(imageRef.size) }}
					</div>
				</div>
				<div v-if="props.controls" :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						{{ i18n.ts.clickToShow }}
					</div>
				</div>
			</div>
		</template>

		<template v-else-if="props.controls">
			<div :class="$style.controlsUpperRight">
				<button
					v-tooltip="i18n.ts.hide"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
					@click.stop="hideRef = true"
				>
					<div :class="$style.controlButton"><i class="ti ti-eye-off"></i></div>
				</button>
			</div>

			<div :class="$style.controlsLowerRight">
				<button
					:class="['_button', $style.controlItem]"
					tabindex="-1"
					@click.stop="() => {}"
					@mousedown.prevent.stop="showImageMenu"
				>
					<div :class="$style.controlButton"><i class="ti ti-dots"></i></div>
				</button>
			</div>

			<div :class="$style.controlsLowerLeft">
				<button
					v-if="imageRef.comment"
					v-tooltip:dialog="imageRef.comment"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
					@click.stop="() => {}"
				>
					<div :class="$style.controlButton"><span data-testid="alt">ALT</span></div>
				</button>
			</div>

			<div :class="$style.controlsUpperLeft">
				<button
					v-if="['image/gif', 'image/apng'].includes(imageRef.type)"
					v-tooltip:dialog="i18n.ts._tms.displayingGifFiles"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
					@click.stop="() => {}"
				>
					<div :class="$style.controlButton"><span data-testid="gif">GIF</span></div>
				</button>
				<button
					v-if="imageRef.isSensitive"
					v-tooltip:dialog="i18n.ts._tms.displayingSensitiveFiles"
					:class="['_button', $style.controlItem]"
					tabindex="-1"
					@click.stop="() => {}"
				>
					<div :class="$style.controlButton"><span data-testid="nsfw">NSFW</span></div>
				</button>
			</div>
		</template>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import type * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import { confirm, popupMenu } from '@/os.js';
import { defaultStore } from '@/store.js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import { getMediaMenu } from '@/scripts/tms/get-media-menu.js';
import { useReactiveDriveFile } from '@/scripts/tms/use-reactive-drive-file.js';
import bytes from '@/filters/bytes.js';
import MkImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';

const props = withDefaults(defineProps<{
	image: Misskey.entities.DriveFile;
	raw?: boolean;
	cover?: boolean;
	disableImageLink?: boolean;
	controls?: boolean;
}>(), {
	cover: false,
	disableImageLink: false,
	controls: true,
});

const mock = inject<boolean>('mock', false);

const {
	reactiveDriveFile: imageRef,
	reactiveHide: hideRef,
	reactiveSensitive: sensitiveRef,
	reactiveIAmOwner: iAmOwnerRef,
} = useReactiveDriveFile(() => props.image);

const imageUrlRef = computed(() => {
	if (props.raw || defaultStore.state.loadRawImages) {
		return imageRef.value.url;
	}
	if (defaultStore.state.disableShowingAnimatedImages) {
		return getStaticImageUrl(imageRef.value.url);
	}
	return imageRef.value.thumbnailUrl;
});

const showImage = async (ev: MouseEvent) => {
	if (!props.controls || !hideRef.value) return;
	if (sensitiveRef.value && defaultStore.state.confirmWhenRevealingSensitiveMedia) {
		ev.stopPropagation();
		const { canceled } = await confirm({
			type: 'question',
			text: i18n.ts.sensitiveMediaRevealConfirm,
		});
		if (canceled) return;
	}
	hideRef.value = false;
};

const showImageMenu = (ev: MouseEvent) => {
	popupMenu(getMediaMenu({
		reactiveDriveFile: imageRef,
		reactiveHide: hideRef,
		reactiveSensitive: sensitiveRef,
		reactiveIAmOwner: iAmOwnerRef,
		mock,
		additionalMenu: [],
	}), ev.currentTarget ?? ev.target);
};
</script>

<style lang="scss" module>
.cq {
	container: mediaImage / inline-size;
}

.root {
	--mediaImage-scale: 1;
	box-sizing: border-box;
	position: relative;
	width: 100%;
	height: 100%;
	overflow: clip;
	border-radius: var(--mediaList-radius, 8px);

	&:focus-visible {
		outline: none;
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

.rootSensitive {
	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: inherit;
		box-shadow: inset 0 0 0 4px var(--MI_THEME-warn);
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

.controlsUpperRight {
	@extend %Controls;
	top: 0;
	right: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-bottom: 0;

		&:first-child {
			padding-left: 0;
		}
	}
}

.controlsLowerRight {
	@extend %Controls;
	right: 0;
	bottom: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-top: 0;

		&:first-child {
			padding-left: 0;
		}
	}
}

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
	background-color: rgba(0, 0, 0, 0.5);
	color: #fff;
	transition: background-color 0.1s ease;

	&:hover {
		background-color: rgba(0, 0, 0, 0.7);
	}
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
