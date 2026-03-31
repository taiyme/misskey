<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-panel :class="$style.about">
	<div ref="containerEl" :class="[$style.container, { [$style.playing]: easterEggEngine != null }]">
		<img src="/client-assets/about-icon.png" alt="" :class="$style.icon" draggable="false" @load="iconLoaded" @click="gravity"/>
		<div :class="$style.misskey">taiyme</div>
		<div :class="$style.version">v{{ version }}</div>
		<span v-for="emoji in easterEggEmojis" :key="emoji.id" :class="[$style.emoji, { _physics_circle_: !emoji.emoji.startsWith(':') }]" :data-physics-x="emoji.left" :data-physics-y="emoji.top">
			<MkCustomEmoji v-if="emoji.emoji[0] === ':'" :class="$style.emojiInner" :name="emoji.emoji" :normal="true" :noStyle="true" :fallbackToImage="true"/>
			<MkEmoji v-else :class="$style.emojiInner" :emoji="emoji.emoji" :normal="true" :noStyle="true"/>
		</span>
	</div>
	<button v-if="thereIsTreasure" :class="$style.treasure" class="_button" @click="getTreasure">
		<img src="/fluent-emoji/1f3c6.png" :class="$style.treasureInner">
	</button>
</div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue';
import { version } from '@@/js/config.js';
import { DEFAULT_EMOJIS } from '@@/js/const.js';
import { physics } from '@/utility/physics.js';
import { claimAchievement, claimedAchievements } from '@/utility/achievements.js';
import { $i } from '@/i.js';
import { prefer } from '@/preferences.js';

const thereIsTreasure = ref($i && !claimedAchievements.includes('foundTreasure'));

let easterEggReady = false;
const easterEggEmojis = ref<{
	id: string,
	top: number,
	left: number,
	emoji: string
}[]>([]);
const easterEggEngine = ref<{ stop: () => void } | null>(null);
const containerEl = useTemplateRef('containerEl');

function iconLoaded() {
	if (containerEl.value == null) return;
	const emojis = prefer.s.emojiPalettes[0]?.emojis ?? [];

	if (emojis.length < DEFAULT_EMOJIS.length) {
		emojis.push(...DEFAULT_EMOJIS.slice(0, DEFAULT_EMOJIS.length - emojis.length));
	}

	const containerWidth = containerEl.value.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.value.push({
			id: i.toString(),
			top: -(128 + (Math.random() * 256)),
			left: (Math.random() * containerWidth),
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (containerEl.value == null) return;
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine.value = physics(containerEl.value);
}

function getTreasure() {
	thereIsTreasure.value = false;
	claimAchievement('foundTreasure');
}

onBeforeUnmount(() => {
	if (easterEggEngine.value) {
		easterEggEngine.value.stop();
	}
});
</script>

<style lang="scss" module>
.about {
	position: relative;
	border-radius: var(--MI-radius);
}

.treasure {
	position: absolute;
	top: 60px;
	left: 0;
	right: 0;
	margin: 0 auto;
	width: min-content;

	> .treasureInner {
		width: 25px;
		vertical-align: bottom;
	}
}

.container {
	position: relative;
	text-align: center;
	padding: 16px;

	&.playing {
		&, * {
			user-select: none;
		}

		* {
			will-change: transform;
		}

		> .emoji {
			visibility: visible;
		}
	}
}

.icon {
	display: block;
	width: 80px;
	margin: 0 auto;
	border-radius: 16px;
	position: relative;
	z-index: 1;
}

.misskey {
	margin: 0.75em auto 0 auto;
	width: max-content;
	position: relative;
	z-index: 1;
}

.version {
	margin: 0 auto;
	width: max-content;
	opacity: 0.5;
	position: relative;
	z-index: 1;
}

.emoji {
	position: absolute;
	z-index: 1;
	top: 0;
	left: 0;
	visibility: hidden;

	> .emojiInner {
		pointer-events: none;
		font-size: 24px;
		width: 24px;
	}
}
</style>
