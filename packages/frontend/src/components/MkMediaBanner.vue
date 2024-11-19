<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<div
		:class="{
			[$style.root]: true,
			[$style.rootSensitive]: sensitiveRef,
		}"
		@click="showMedia"
		@contextmenu.stop="() => {}"
	>
		<template v-if="hideRef">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div v-if="mediaRef.isSensitive" :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveFile }}
					</div>
					<div v-else :class="$style.hideInfoTitle">
						<i class="ti ti-file"></i> {{ i18n.ts.file }}
					</div>
				</div>
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						{{ i18n.ts.clickToShow }}
					</div>
				</div>
			</div>
		</template>

		<div v-else :class="$style.downloadContainer">
			<a
				:class="$style.downloadLink"
				:href="mediaRef.url"
				:title="mediaRef.name"
				:download="mediaRef.name"
			>
				<div
					:class="{
						[$style.downloadIcon]: true,
						[$style.hasSize]: mediaRef.size,
					}"
				>
					<i class="ti ti-download" style="font-size: 1.6em;"></i>
					<span v-if="mediaRef.size" style="font-size: 0.7em;">{{ bytes(mediaRef.size) }}</span>
				</div>
				<div :class="$style.downloadText">{{ mediaRef.name }}</div>
			</a>
			<button
				:class="['_button', $style.downloadMenu]"
				tabindex="-1"
				@click.stop="() => {}"
				@mousedown.prevent.stop="showMediaMenu"
			>
				<i class="ti ti-settings"></i>
			</button>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import type * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import { confirm, popupMenu } from '@/os.js';
import { defaultStore } from '@/store.js';
import { getMediaMenu } from '@/scripts/tms/get-media-menu.js';
import { useReactiveDriveFile } from '@/scripts/tms/use-reactive-drive-file.js';
import bytes from '@/filters/bytes.js';

const props = defineProps<{
	media: Misskey.entities.DriveFile;
}>();

const mock = inject<boolean>('mock', false);

const {
	reactiveDriveFile: mediaRef,
	reactiveHide: hideRef,
	reactiveSensitive: sensitiveRef,
	reactiveIAmOwner: iAmOwnerRef,
} = useReactiveDriveFile(() => props.media);

const showMedia = async (ev: MouseEvent) => {
	if (!hideRef.value) return;
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

const showMediaMenu = (ev: MouseEvent) => {
	popupMenu(getMediaMenu({
		reactiveDriveFile: mediaRef,
		reactiveHide: hideRef,
		reactiveSensitive: sensitiveRef,
		reactiveIAmOwner: iAmOwnerRef,
		mock,
		additionalMenu: [],
	}), ev.currentTarget ?? ev.target, { align: 'right' });
};
</script>

<style lang="scss" module>
.cq {
	container: mediaBanner / inline-size;
}

.root {
	--mediaBanner-scale: 1;
	box-sizing: border-box;
	position: relative;
	width: 100%;
	height: 100%;
	overflow: clip;
	border: 0.5px solid var(--MI_THEME-divider);
	border-radius: var(--mediaList-radius, 8px);

	&:focus-visible {
		outline: none;
	}
}

.rootSensitive {
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
		box-shadow: inset 0 0 0 4px var(--MI_THEME-warn);
	}
}

.hideInfo {
	padding: 12px 0;
	display: flex;
	width: 100%;
	height: 100%;
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
	font-size: clamp(6px, calc(12px * var(--mediaBanner-scale)), 12px);
	color: #fff;
}

.hideInfoTitle {
	@extend %HideInfoText;
	font-weight: 700;
}

.hideInfoText {
	@extend %HideInfoText;
}

.downloadContainer {
	display: flex;
	align-items: stretch;
	overflow: clip;
}

.downloadLink {
	flex-grow: 1;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px;
	overflow: clip;

	&:hover {
		text-decoration: none;
		color: var(--MI_THEME-accent);
		background-color: var(--MI_THEME-accentedBg);
	}
}

.downloadIcon {
	display: flex;
	flex-direction: column;
	align-items: center;

	&.hasSize {
		margin: -5px 0;
	}
}

.downloadText {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: 0.9em;
	font-weight: 700;
}

.downloadMenu {
	padding: 10px 16px;
	font-size: 1.05rem;

	&:hover {
		color: var(--MI_THEME-accent);
		background-color: var(--MI_THEME-accentedBg);
	}

	&:focus-visible {
		outline: none;
	}
}

@container mediaBanner (max-width: 250px) {
	.root {
		--mediaBanner-scale: 0.90;
	}
}

@container mediaBanner (max-width: 200px) {
	.root {
		--mediaBanner-scale: 0.85;
	}
}

@container mediaBanner (max-width: 150px) {
	.root {
		--mediaBanner-scale: 0.80;
	}
}

@container mediaBanner (max-width: 130px) {
	.root {
		--mediaBanner-scale: 0.75;
	}
}

@container mediaBanner (max-width: 120px) {
	.root {
		--mediaBanner-scale: 0.70;
	}
}

@container mediaBanner (max-width: 110px) {
	.root {
		--mediaBanner-scale: 0.65;
	}
}

@container mediaBanner (max-width: 100px) {
	.root {
		--mediaBanner-scale: 0.60;
	}
}
</style>
