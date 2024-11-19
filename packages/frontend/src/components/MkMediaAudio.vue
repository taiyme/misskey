<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<div
		ref="playerEl"
		v-hotkey="keymap"
		:class="{
			[$style.root]: true,
			[$style.rootSensitive]: sensitiveRef,
		}"
		tabindex="0"
		@click="showAudio"
		@contextmenu.stop="() => {}"
		@keydown.stop="() => {}"
	>
		<template v-if="hideRef">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div v-if="audioRef.isSensitive" :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveAudio }}
					</div>
					<div v-else :class="$style.hideInfoTitle">
						<i class="ti ti-music"></i> {{ i18n.ts.audio }}
					</div>
				</div>
				<div v-if="defaultStore.state.dataSaver.media && audioRef.size" :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						<i class="ti ti-cloud-download"></i> {{ bytes(audioRef.size) }}
					</div>
				</div>
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						{{ i18n.ts.clickToShow }}
					</div>
				</div>
			</div>
		</template>

		<div v-else-if="defaultStore.reactiveState.useNativeUIForVideoAudioPlayer.value" :class="$style.nativeAudioContainer">
			<audio
				ref="audioEl"
				preload="metadata"
				controls
				:class="$style.nativeAudio"
				@keydown.prevent="() => {}"
			>
				<source :src="audioRef.url">
			</audio>
		</div>

		<div v-else :class="$style.audioControls">
			<audio
				ref="audioEl"
				preload="metadata"
				@keydown.prevent="() => {}"
			>
				<source :src="audioRef.url">
			</audio>
			<div :class="[$style.controlsChild, $style.controlsLeft]">
				<button
					:class="['_button', $style.controlButton]"
					tabindex="-1"
					@click.stop="togglePlayPause"
				>
					<i v-if="isPlaying" class="ti ti-player-pause-filled"></i>
					<i v-else class="ti ti-player-play-filled"></i>
				</button>
			</div>
			<div :class="[$style.controlsChild, $style.controlsRight]">
				<button
					:class="['_button', $style.controlButton]"
					tabindex="-1"
					@click.stop="() => {}"
					@mousedown.prevent.stop="showAudioMenu"
				>
					<i class="ti ti-settings"></i>
				</button>
			</div>
			<div :class="[$style.controlsChild, $style.controlsTime]">{{ hms(elapsedTimeMs) }}</div>
			<div :class="[$style.controlsChild, $style.controlsVolume]">
				<button
					:class="['_button', $style.controlButton]"
					tabindex="-1"
					@click.stop="toggleMute"
				>
					<i v-if="volume === 0" class="ti ti-volume-3"></i>
					<i v-else class="ti ti-volume"></i>
				</button>
				<MkMediaRange
					v-model="volume"
					:class="$style.volumeSeekbar"
				/>
			</div>
			<MkMediaRange
				v-model="rangePercent"
				:class="$style.seekbarRoot"
				:buffer="bufferedDataRatio"
			/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, inject, onActivated, onDeactivated, onMounted, ref, shallowRef, watch } from 'vue';
import type * as Misskey from 'misskey-js';
import type { MenuItem } from '@/types/menu.js';
import { i18n } from '@/i18n.js';
import { confirm, popupMenu } from '@/os.js';
import { defaultStore } from '@/store.js';
import { type Keymap } from '@/scripts/hotkey.js';
import { getMediaMenu } from '@/scripts/tms/get-media-menu.js';
import { useReactiveDriveFile } from '@/scripts/tms/use-reactive-drive-file.js';
import bytes from '@/filters/bytes.js';
import { hms } from '@/filters/hms.js';
import MkMediaRange from '@/components/MkMediaRange.vue';

const props = defineProps<{
	audio: Misskey.entities.DriveFile;
}>();

const mock = inject<boolean>('mock', false);

const {
	reactiveDriveFile: audioRef,
	reactiveHide: hideRef,
	reactiveSensitive: sensitiveRef,
	reactiveIAmOwner: iAmOwnerRef,
} = useReactiveDriveFile(() => props.audio);

const showAudio = async (ev: MouseEvent) => {
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

// Menu
const menuShowing = ref(false);

const showAudioMenu = (ev: MouseEvent) => {
	const additionalMenu: MenuItem[] = [];

	// TODO: 再生キューに追加

	additionalMenu.push({
		type: 'switch',
		text: i18n.ts._mediaControls.loop,
		icon: 'ti ti-repeat',
		ref: loop,
	});

	additionalMenu.push({
		type: 'radio',
		text: i18n.ts._mediaControls.playbackRate,
		icon: 'ti ti-clock-play',
		ref: speed,
		options: {
			'0.25x': 0.25,
			'0.5x': 0.5,
			'0.75x': 0.75,
			'1.0x': 1,
			'1.25x': 1.25,
			'1.5x': 1.5,
			'2.0x': 2,
		},
	});

	menuShowing.value = true;
	popupMenu(getMediaMenu({
		reactiveDriveFile: audioRef,
		reactiveHide: hideRef,
		reactiveSensitive: sensitiveRef,
		reactiveIAmOwner: iAmOwnerRef,
		mock,
		additionalMenu,
	}), ev.currentTarget ?? ev.target, {
		align: 'right',
		onClosing: () => {
			menuShowing.value = false;
		},
	});
};

const keymap = {
	'up': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				volume.value = Math.min(volume.value + 0.1, 1);
			}
		},
	},
	'down': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				volume.value = Math.max(volume.value - 0.1, 0);
			}
		},
	},
	'left': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				audioEl.value.currentTime = Math.max(audioEl.value.currentTime - 5, 0);
			}
		},
	},
	'right': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				audioEl.value.currentTime = Math.min(audioEl.value.currentTime + 5, audioEl.value.duration);
			}
		},
	},
	'space': () => {
		if (hasFocus()) {
			togglePlayPause();
		}
	},
} as const satisfies Keymap;

// PlayerElもしくはその子要素にフォーカスがあるかどうか
function hasFocus() {
	if (!playerEl.value) return false;
	return playerEl.value === document.activeElement || playerEl.value.contains(document.activeElement);
}

const playerEl = shallowRef<HTMLDivElement>();
const audioEl = shallowRef<HTMLAudioElement>();

// MediaControl: Common State
const oncePlayed = ref(false);
const isReady = ref(false);
const isPlaying = ref(false);
const isActuallyPlaying = ref(false);
const elapsedTimeMs = ref(0);
const durationMs = ref(0);
const rangePercent = computed({
	get: () => {
		return (elapsedTimeMs.value / durationMs.value) || 0;
	},
	set: (to) => {
		if (!audioEl.value) return;
		audioEl.value.currentTime = to * durationMs.value / 1000;
	},
});
const volume = ref(0.25);
const speed = ref(1);
const loop = ref(false); // TODO: ドライブファイルのフラグに置き換える
const bufferedEnd = ref(0);
const bufferedDataRatio = computed(() => {
	if (!audioEl.value) return 0;
	return bufferedEnd.value / audioEl.value.duration;
});

// MediaControl Events
function togglePlayPause() {
	if (!isReady.value || !audioEl.value) return;

	if (isPlaying.value) {
		audioEl.value.pause();
		isPlaying.value = false;
	} else {
		audioEl.value.play();
		isPlaying.value = true;
		oncePlayed.value = true;
	}
}

function toggleMute() {
	if (volume.value === 0) {
		volume.value = 0.25;
	} else {
		volume.value = 0;
	}
}

let onceInit = false;
let mediaTickFrameId: number | null = null;
let stopAudioElWatch: () => void;

function init() {
	if (onceInit) return;
	onceInit = true;

	stopAudioElWatch = watch(audioEl, () => {
		if (audioEl.value) {
			isReady.value = true;

			function updateMediaTick() {
				if (audioEl.value) {
					try {
						bufferedEnd.value = audioEl.value.buffered.end(0);
					} catch (err) {
						bufferedEnd.value = 0;
					}

					elapsedTimeMs.value = audioEl.value.currentTime * 1000;

					if (audioEl.value.loop !== loop.value) {
						loop.value = audioEl.value.loop;
					}
				}
				mediaTickFrameId = window.requestAnimationFrame(updateMediaTick);
			}

			updateMediaTick();

			audioEl.value.addEventListener('play', () => {
				isActuallyPlaying.value = true;
			}, { passive: true });

			audioEl.value.addEventListener('pause', () => {
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			}, { passive: true });

			audioEl.value.addEventListener('ended', () => {
				oncePlayed.value = false;
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			}, { passive: true });

			durationMs.value = audioEl.value.duration * 1000;
			audioEl.value.addEventListener('durationchange', () => {
				if (audioEl.value) {
					durationMs.value = audioEl.value.duration * 1000;
				}
			}, { passive: true });

			audioEl.value.volume = volume.value;
		}
	}, {
		immediate: true,
	});
}

watch(volume, (to) => {
	if (audioEl.value) audioEl.value.volume = to;
});

watch(speed, (to) => {
	if (audioEl.value) audioEl.value.playbackRate = to;
});

watch(loop, (to) => {
	if (audioEl.value) audioEl.value.loop = to;
});

onMounted(() => {
	init();
});

onActivated(() => {
	init();
});

onDeactivated(() => {
	isReady.value = false;
	isPlaying.value = false;
	isActuallyPlaying.value = false;
	elapsedTimeMs.value = 0;
	durationMs.value = 0;
	bufferedEnd.value = 0;
	stopAudioElWatch();
	onceInit = false;
	if (mediaTickFrameId) {
		window.cancelAnimationFrame(mediaTickFrameId);
		mediaTickFrameId = null;
	}
});
</script>

<style lang="scss" module>
.cq {
	container: mediaAudio / inline-size;
}

.root {
	--mediaAudio-scale: 1;
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

.audioControls {
	display: grid;
	grid-template-areas:
		"left time . volume right"
		"seekbar seekbar seekbar seekbar seekbar";
	grid-template-columns: auto auto 1fr auto auto;
	align-items: center;
	gap: 4px 8px;
	padding: 10px;
}

.controlsChild {
	display: flex;
	align-items: center;
	gap: 4px;

	.controlButton {
		padding: 6px;
		border-radius: calc(var(--mediaList-radius, 8px) / 2);
		font-size: 1.05rem;

		&:hover {
			color: var(--MI_THEME-accent);
			background-color: var(--MI_THEME-accentedBg);
		}

		&:focus-visible {
			outline: none;
		}
	}
}

.controlsLeft {
	grid-area: left;
}

.controlsRight {
	grid-area: right;
}

.controlsTime {
	grid-area: time;
	font-size: 0.9rem;
}

.controlsVolume {
	grid-area: volume;

	.volumeSeekbar {
		display: none;
	}
}

.seekbarRoot {
	grid-area: seekbar;
}

@container mediaAudio (min-width: 500px) {
	.audioControls {
		grid-template-areas: "left seekbar time volume right";
		grid-template-columns: auto 1fr auto auto auto;
	}

	.controlsVolume {
		.volumeSeekbar {
			max-width: 90px;
			display: block;
			flex-grow: 1;
		}
	}
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

.nativeAudioContainer {
	display: flex;
	align-items: center;
	padding: 6px;
}

.nativeAudio {
	display: block;
	width: 100%;
}
</style>
