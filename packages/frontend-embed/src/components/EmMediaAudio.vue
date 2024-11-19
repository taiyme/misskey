<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<a
		:href="notePage(appearNote)"
		:class="$style.root"
		target="_blank"
		rel="noopener"
		tabindex="0"
	>
		<template v-if="audioRef.isSensitive">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveFile }}
					</div>
				</div>
			</div>
		</template>

		<div v-else :class="$style.labelContainer">
			<div>
				<i class="ti ti-music" style="font-size: 1.2em;"></i>
			</div>
			<div :class="$style.labelText">{{ audioRef.name }}</div>
			<div style="margin-left: auto;">
				<i class="ti ti-chevron-right"></i>
			</div>
		</div>
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
	audio: Misskey.entities.DriveFile;
}>();

const audioRef = computed(() => props.audio);
</script>

<style lang="scss" module>
.cq {
	container: mediaAudio / inline-size;
}

.root {
	--mediaAudio-scale: 1;
	box-sizing: border-box;
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	overflow: clip;
	border: 0.5px solid var(--MI_THEME-divider);
	border-radius: var(--mediaList-radius, 8px);
	transition: background-color 0.1s ease;

	&:focus-visible {
		outline: none;
	}

	&:hover {
		text-decoration: none;
		color: var(--MI_THEME-accent);
		background-color: var(--MI_THEME-accentedBg);
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
	font-size: clamp(6px, calc(12px * var(--mediaAudio-scale)), 12px);
	color: #fff;
}

.hideInfoTitle {
	@extend %HideInfoText;
	font-weight: 700;
}

.hideInfoText {
	@extend %HideInfoText;
}

.labelContainer {
	flex-grow: 1;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px;
	overflow: clip;
}

.labelText {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: 0.9em;
	font-weight: 700;
}

@container mediaAudio (max-width: 250px) {
	.root {
		--mediaAudio-scale: 0.90;
	}
}

@container mediaAudio (max-width: 200px) {
	.root {
		--mediaAudio-scale: 0.85;
	}
}

@container mediaAudio (max-width: 150px) {
	.root {
		--mediaAudio-scale: 0.80;
	}
}

@container mediaAudio (max-width: 130px) {
	.root {
		--mediaAudio-scale: 0.75;
	}
}

@container mediaAudio (max-width: 120px) {
	.root {
		--mediaAudio-scale: 0.70;
	}
}

@container mediaAudio (max-width: 110px) {
	.root {
		--mediaAudio-scale: 0.65;
	}
}

@container mediaAudio (max-width: 100px) {
	.root {
		--mediaAudio-scale: 0.60;
	}
}
</style>
