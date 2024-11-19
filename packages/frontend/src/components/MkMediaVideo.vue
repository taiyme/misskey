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
			[$style.active]: controlsShowing,
			[$style.rootVisible]: !hideRef,
			[$style.rootSensitive]: sensitiveRef,
		}"
		tabindex="0"
		@click="showVideo"
		@mouseover="onMouseOver"
		@mouseleave="onMouseLeave"
		@contextmenu.stop="() => {}"
		@keydown.stop="() => {}"
	>
		<template v-if="hideRef">
			<div :class="['_noSelect', $style.hideInfo]">
				<div :class="$style.hideInfoItem">
					<div v-if="videoRef.isSensitive" :class="$style.hideInfoTitle">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts._tms.sensitiveVideo }}
					</div>
					<div v-else :class="$style.hideInfoTitle">
						<i class="ti ti-movie"></i> {{ i18n.ts.video }}
					</div>
				</div>
				<div v-if="defaultStore.state.dataSaver.media && videoRef.size" :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						<i class="ti ti-cloud-download"></i> {{ bytes(videoRef.size) }}
					</div>
				</div>
				<div :class="$style.hideInfoItem">
					<div :class="$style.hideInfoText">
						{{ i18n.ts.clickToShow }}
					</div>
				</div>
			</div>
		</template>

		<div v-else-if="defaultStore.reactiveState.useNativeUIForVideoAudioPlayer.value" :class="$style.videoRoot">
			<video
				ref="videoEl"
				:class="$style.video"
				:poster="videoRef.thumbnailUrl ?? undefined"
				:title="videoRef.comment ?? undefined"
				:alt="videoRef.comment"
				preload="metadata"
				controls
				@keydown.prevent="() => {}"
			>
				<source :src="videoRef.url">
			</video>
			<i class="ti ti-eye-off" :class="$style.hide" @click.stop="hideRef = true"></i>
			<div :class="$style.indicators">
				<div v-if="videoRef.comment" :class="$style.indicator">ALT</div>
				<div v-if="videoRef.isSensitive" :class="$style.indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
			</div>
		</div>

		<div v-else :class="$style.videoRoot">
			<video
				ref="videoEl"
				:class="$style.video"
				:poster="videoRef.thumbnailUrl ?? undefined"
				:title="videoRef.comment ?? undefined"
				:alt="videoRef.comment"
				preload="metadata"
				playsinline
				@keydown.prevent="() => {}"
				@click.stop.self="togglePlayPause"
			>
				<source :src="videoRef.url">
			</video>
			<button
				v-if="isReady && !isPlaying"
				:class="['_button', $style.videoOverlayPlayButton]"
				tabindex="-1"
				@click.stop="togglePlayPause"
			>
				<i class="ti ti-player-play-filled"></i>
			</button>
			<div v-else-if="!isActuallyPlaying" :class="$style.videoLoading">
				<MkLoading/>
			</div>
			<i class="ti ti-eye-off" :class="$style.hide" @click.stop="hideRef = true"></i>
			<div :class="$style.indicators">
				<div v-if="videoRef.comment" :class="$style.indicator">ALT</div>
				<div v-if="videoRef.isSensitive" :class="$style.indicator" style="color: var(--MI_THEME-warn);" :title="i18n.ts.sensitive"><i class="ti ti-eye-exclamation"></i></div>
			</div>
			<div :class="$style.videoControls" @click.stop.self="togglePlayPause">
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
						@mousedown.prevent.stop="showVideoMenu"
					>
						<i class="ti ti-settings"></i>
					</button>
					<button
						:class="['_button', $style.controlButton]"
						tabindex="-1"
						@click.stop="toggleFullscreen"
					>
						<i v-if="isFullscreen" class="ti ti-arrows-minimize"></i>
						<i v-else class="ti ti-arrows-maximize"></i>
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
						:sliderBgWhite="true"
						:class="$style.volumeSeekbar"
					/>
				</div>
				<MkMediaRange
					v-model="rangePercent"
					:sliderBgWhite="true"
					:class="$style.seekbarRoot"
					:buffer="bufferedDataRatio"
				/>
			</div>
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
import { isFullscreenNotSupported } from '@/scripts/device-kind.js';
import { type Keymap } from '@/scripts/hotkey.js';
import hasAudio from '@/scripts/media-has-audio.js';
import { getMediaMenu } from '@/scripts/tms/get-media-menu.js';
import { useReactiveDriveFile } from '@/scripts/tms/use-reactive-drive-file.js';
import bytes from '@/filters/bytes.js';
import { hms } from '@/filters/hms.js';
import MkMediaRange from '@/components/MkMediaRange.vue';

const props = defineProps<{
	video: Misskey.entities.DriveFile;
}>();

const mock = inject<boolean>('mock', false);

const {
	reactiveDriveFile: videoRef,
	reactiveHide: hideRef,
	reactiveSensitive: sensitiveRef,
	reactiveIAmOwner: iAmOwnerRef,
} = useReactiveDriveFile(() => props.video);

const showVideo = async (ev: MouseEvent) => {
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

const showVideoMenu = (ev: MouseEvent) => {
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

	if (document.pictureInPictureEnabled) {
		additionalMenu.push({
			text: i18n.ts._mediaControls.pip,
			icon: 'ti ti-picture-in-picture',
			action: togglePictureInPicture,
		});
	}

	menuShowing.value = true;
	popupMenu(getMediaMenu({
		reactiveDriveFile: videoRef,
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
			if (hasFocus() && videoEl.value) {
				volume.value = Math.min(volume.value + 0.1, 1);
			}
		},
	},
	'down': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && videoEl.value) {
				volume.value = Math.max(volume.value - 0.1, 0);
			}
		},
	},
	'left': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && videoEl.value) {
				videoEl.value.currentTime = Math.max(videoEl.value.currentTime - 5, 0);
			}
		},
	},
	'right': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && videoEl.value) {
				videoEl.value.currentTime = Math.min(videoEl.value.currentTime + 5, videoEl.value.duration);
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

// MediaControl: Video State
const videoEl = shallowRef<HTMLVideoElement>();
const playerEl = shallowRef<HTMLDivElement>();
const isHoverring = ref(false);
const controlsShowing = computed(() => {
	if (!oncePlayed.value) return true;
	if (isHoverring.value) return true;
	if (menuShowing.value) return true;
	return false;
});
const isFullscreen = ref(false);
let controlStateTimer: string | number;

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
		if (!videoEl.value) return;
		videoEl.value.currentTime = to * durationMs.value / 1000;
	},
});
const volume = ref(0.25);
const speed = ref(1);
const loop = ref(false); // TODO: ドライブファイルのフラグに置き換える
const bufferedEnd = ref(0);
const bufferedDataRatio = computed(() => {
	if (!videoEl.value) return 0;
	return bufferedEnd.value / videoEl.value.duration;
});

// MediaControl Events
function onMouseOver() {
	if (controlStateTimer) {
		clearTimeout(controlStateTimer);
	}
	isHoverring.value = true;
}

function onMouseLeave() {
	controlStateTimer = window.setTimeout(() => {
		isHoverring.value = false;
	}, 100);
}

function togglePlayPause() {
	if (!isReady.value || !videoEl.value) return;

	if (isPlaying.value) {
		videoEl.value.pause();
		isPlaying.value = false;
	} else {
		videoEl.value.play();
		isPlaying.value = true;
		oncePlayed.value = true;
	}
}

function toggleFullscreen() {
	if (isFullscreenNotSupported && videoEl.value) {
		if (isFullscreen.value) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			videoEl.value.webkitExitFullscreen();
			isFullscreen.value = false;
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			videoEl.value.webkitEnterFullscreen();
			isFullscreen.value = true;
		}
	} else if (playerEl.value) {
		if (isFullscreen.value) {
			document.exitFullscreen();
			isFullscreen.value = false;
		} else {
			playerEl.value.requestFullscreen({ navigationUI: 'hide' });
			isFullscreen.value = true;
		}
	}
}

function togglePictureInPicture() {
	if (videoEl.value) {
		if (document.pictureInPictureElement) {
			document.exitPictureInPicture();
		} else {
			videoEl.value.requestPictureInPicture();
		}
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
let stopVideoElWatch: () => void;

function init() {
	if (onceInit) return;
	onceInit = true;

	stopVideoElWatch = watch(videoEl, () => {
		if (videoEl.value) {
			isReady.value = true;

			function updateMediaTick() {
				if (videoEl.value) {
					try {
						bufferedEnd.value = videoEl.value.buffered.end(0);
					} catch (err) {
						bufferedEnd.value = 0;
					}

					elapsedTimeMs.value = videoEl.value.currentTime * 1000;

					if (videoEl.value.loop !== loop.value) {
						loop.value = videoEl.value.loop;
					}
				}
				mediaTickFrameId = window.requestAnimationFrame(updateMediaTick);
			}

			updateMediaTick();

			videoEl.value.addEventListener('play', () => {
				isActuallyPlaying.value = true;
			}, { passive: true });

			videoEl.value.addEventListener('pause', () => {
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			}, { passive: true });

			videoEl.value.addEventListener('ended', () => {
				oncePlayed.value = false;
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			}, { passive: true });

			durationMs.value = videoEl.value.duration * 1000;
			videoEl.value.addEventListener('durationchange', () => {
				if (videoEl.value) {
					durationMs.value = videoEl.value.duration * 1000;
				}
			}, { passive: true });

			videoEl.value.volume = volume.value;
			hasAudio(videoEl.value).then(had => {
				if (!had && videoEl.value) {
					videoEl.value.loop = videoEl.value.muted = true;
					videoEl.value.play();
				}
			});
		}
	}, {
		immediate: true,
	});
}

watch(volume, (to) => {
	if (videoEl.value) videoEl.value.volume = to;
});

watch(speed, (to) => {
	if (videoEl.value) videoEl.value.playbackRate = to;
});

watch(loop, (to) => {
	if (videoEl.value) videoEl.value.loop = to;
});

watch(hideRef, (to) => {
	if (to && isFullscreen.value) {
		document.exitFullscreen();
		isFullscreen.value = false;
	}
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
	stopVideoElWatch();
	onceInit = false;
	if (mediaTickFrameId) {
		window.cancelAnimationFrame(mediaTickFrameId);
		mediaTickFrameId = null;
	}
});
</script>

<style lang="scss" module>
.cq {
	container: mediaVideo / inline-size;
}

.root {
	--mediaVideo-scale: 1;
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

.indicators {
	display: inline-flex;
	position: absolute;
	top: 10px;
	left: 10px;
	pointer-events: none;
	opacity: 0.5;
	gap: 6px;
}

.indicator {
	/* Hardcode to black because either --MI_THEME-bg or --MI_THEME-fg makes it hard to read in dark/light mode */
	background-color: black;
	border-radius: 6px;
	color: var(--MI_THEME-accentLighten);
	display: inline-block;
	font-weight: bold;
	font-size: 0.8em;
	padding: 2px 5px;
}

.hide {
	display: block;
	position: absolute;
	border-radius: 6px;
	background-color: var(--MI_THEME-fg);
	color: var(--MI_THEME-accentLighten);
	font-size: 12px;
	opacity: 0.5;
	padding: 5px 8px;
	text-align: center;
	cursor: pointer;
	top: 12px;
	right: 12px;
}

.videoRoot {
	background: #000;
	position: relative;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.video {
	display: block;
	height: 100%;
	width: 100%;
}

.videoOverlayPlayButton {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

	opacity: 0;
	transition: opacity 0.4s ease-in-out;

	background: var(--MI_THEME-accent);
	color: #fff;
	padding: 1rem;
	border-radius: 99rem;

	font-size: 1.1rem;

	&:focus-visible {
		outline: none;
	}
}

.videoLoading {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.videoControls {
	display: grid;
	grid-template-areas:
		"left time . volume right"
		"seekbar seekbar seekbar seekbar seekbar";
	grid-template-columns: auto auto 1fr auto auto;
	align-items: center;
	gap: 4px 8px;

	padding: 35px 10px 10px 10px;
	background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75));

	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;

	transform: translateY(100%);
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.active {
	.videoControls {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	.videoOverlayPlayButton {
		opacity: 1;
	}
}

.controlsChild {
	display: flex;
	align-items: center;
	gap: 4px;
	color: #fff;

	.controlButton {
		padding: 6px;
		border-radius: calc(var(--mediaList-radius, 8px) / 2);
		transition: background-color 0.2s ease-in-out;
		font-size: 1.05rem;

		&:hover {
			background-color: var(--MI_THEME-accent);
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
	/* ▼シークバー操作をやりやすくするためにクリックイベントが伝播されないエリアを拡張する */
	margin: -10px;
	padding: 10px;
}

@container mediaVideo (min-width: 500px) {
	.videoControls {
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
}
</style>
