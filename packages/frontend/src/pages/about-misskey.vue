<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :contentMax="600" :marginMin="20">
			<div class="_gaps_m znqjceqz">
				<div v-panel class="about">
					<div ref="containerEl" class="container" :class="{ playing: easterEggEngine != null }">
						<img src="/client-assets/about-icon.png" alt="" class="icon" draggable="false" @load="iconLoaded" @click="gravity"/>
						<div class="misskey">Misskey</div>
						<div class="version">{{ withV(version) }}</div>
						<span v-for="emoji in easterEggEmojis" :key="emoji.id" class="emoji" :data-physics-x="emoji.left" :data-physics-y="emoji.top" :class="{ _physics_circle_: !emoji.emoji.startsWith(':') }">
							<MkCustomEmoji v-if="emoji.emoji[0] === ':'" class="emoji" :name="emoji.emoji" :normal="true" :noStyle="true"/>
							<MkEmoji v-else class="emoji" :emoji="emoji.emoji" :normal="true" :noStyle="true"/>
						</span>
					</div>
					<button v-if="thereIsTreasure" class="_button treasure" @click="getTreasure"><img src="/fluent-emoji/1f3c6.png" class="treasureImg"></button>
				</div>
				<div style="text-align: center;">
					{{ i18n.ts._tms.aboutMisskeyDescription }}
				</div>
				<div v-if="$i != null" style="text-align: center;" class="_buttonsCenter">
					<MkButton primary rounded inline @click="iLoveMisskey">I <Mfm text="$[jelly ❤]"/> #Misskey</MkButton>
					<MkButton primary rounded inline @click="taiyIsTaiy">#taiyの読み方はたいいー</MkButton>
				</div>
				<FormSection>
					<div class="_formLinks">
						<FormLink to="https://github.com/taiyme/misskey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutMisskey.source }}
							<template #suffix>taiyme/misskey</template>
						</FormLink>
						<FormLink to="https://u.taiy.me/donate" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ i18n.ts._tms.donateToTaiy }}
							<template #suffix>Donate</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._aboutMisskey.contributors }}</template>
					<div :class="$style.contributors">
						<a href="https://github.com/taiyme" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/53635909?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@taiyme</span>
						</a>
						<a href="https://github.com/cffnpwr" target="_blank" :class="$style.contributor">
							<img src="https://avatars.githubusercontent.com/u/86540016?v=4" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">@cffnpwr</span>
						</a>
					</div>
				</FormSection>
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from 'vue';
import { version } from '@/config.js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import { physics } from '@/scripts/physics.js';
import { i18n } from '@/i18n.js';
import { defaultStore } from '@/store.js';
import * as os from '@/os.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { claimAchievement, claimedAchievements } from '@/scripts/achievements.js';
import { $i } from '@/account.js';
import { withV } from '@/scripts/tms/version.js';

let thereIsTreasure = $ref($i && !claimedAchievements.includes('foundTreasure'));

let easterEggReady = false;
let easterEggEmojis = $ref<{
	id: string;
	top: number;
	left: number;
	emoji: string;
}[]>([]);
let easterEggEngine = $ref<ReturnType<typeof physics> | null>(null);
const containerEl = $shallowRef<HTMLElement>();

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl?.offsetWidth ?? 0;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.push({
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
	if (!easterEggReady) return;
	if (!containerEl) return;
	easterEggReady = false;
	easterEggEngine = physics(containerEl);
}

function iLoveMisskey() {
	os.post({
		initialText: 'I $[jelly ❤] #Misskey',
		instant: true,
	});
}

function taiyIsTaiy() {
	os.post({
		initialText: '#taiyの読み方はたいいー',
		instant: true,
	});
}

function getTreasure() {
	thereIsTreasure = false;
	claimAchievement('foundTreasure');
}

onBeforeUnmount(() => {
	if (easterEggEngine) {
		easterEggEngine.stop();
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts._tms.aboutMisskey,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		border-radius: var(--radius);

		> .treasure {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			margin: 0 auto;
			width: min-content;

			> .treasureImg {
				width: 25px;
				vertical-align: bottom;
			}
		}

		> .container {
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

			> .icon {
				display: block;
				width: 80px;
				margin: 0 auto;
				border-radius: 16px;
				position: relative;
				z-index: 1;
			}

			> .misskey {
				margin: 0.75em auto 0 auto;
				width: max-content;
				position: relative;
				z-index: 1;
			}

			> .version {
				margin: 0 auto;
				width: max-content;
				opacity: 0.5;
				position: relative;
				z-index: 1;
			}

			> .emoji {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				visibility: hidden;

				> .emoji {
					pointer-events: none;
					font-size: 24px;
					width: 24px;
				}
			}
		}
	}
}
</style>

<style lang="scss" module>
.contributors {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.contributor {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--buttonHoverBg);
	}

	&.active {
		color: var(--accent);
		background: var(--buttonHoverBg);
	}
}

.contributorAvatar {
	width: 30px;
	border-radius: 100%;
}

.contributorUsername {
	margin-left: 12px;
}
</style>
