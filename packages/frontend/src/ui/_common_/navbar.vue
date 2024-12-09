<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.iconOnly]: iconOnly }]">
	<div :class="$style.body">
		<div :class="$style.top">
			<div :class="$style.serverLogo">
				<TmsServerLogo :iconOnly="iconOnly" tooltip/>
			</div>
		</div>
		<div :class="$style.middle">
			<MkA v-tooltip.noDelay.right="i18n.ts.timeline" :class="$style.item" :activeClass="$style.active" to="/" exact>
				<i :class="$style.itemIcon" class="ti ti-home ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.timeline }}</span>
			</MkA>
			<template v-for="item in menu" :key="item">
				<div v-if="item === '-'" :class="$style.divider"></div>
				<component
					:is="navbarItemDef[item].to ? 'MkA' : 'button'"
					v-else-if="navbarItemDef[item] && (navbarItemDef[item].show !== false)"
					v-tooltip.noDelay.right="navbarItemDef[item].title"
					class="_button"
					:class="[$style.item, { [$style.active]: navbarItemDef[item].active }]"
					:activeClass="$style.active"
					v-bind="navbarItemDef[item].to ? { to: navbarItemDef[item].to } : {}"
					v-on="navbarItemDef[item].action ? { click: navbarItemDef[item].action } : {}"
				>
					<i class="ti-fw" :class="[$style.itemIcon, navbarItemDef[item].icon]"></i><span :class="$style.itemText">{{ navbarItemDef[item].title }}</span>
					<span v-if="navbarItemDef[item].indicated" :class="$style.itemIndicator" class="_blink">
						<span v-if="navbarItemDef[item].indicateValue" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ navbarItemDef[item].indicateValue }}</span>
						<i v-else class="_indicatorCircle"></i>
					</span>
				</component>
			</template>
			<div :class="$style.divider"></div>
			<MkA v-if="$i?.isAdmin || $i?.isModerator" v-tooltip.noDelay.right="i18n.ts.controlPanel" :class="$style.item" :activeClass="$style.active" to="/admin">
				<i :class="$style.itemIcon" class="ti ti-dashboard ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.controlPanel }}</span>
			</MkA>
			<button class="_button" :class="$style.item" @click="more">
				<i :class="$style.itemIcon" class="ti ti-grid-dots ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.more }}</span>
				<span v-if="otherMenuItemIndicated" :class="$style.itemIndicator" class="_blink"><i class="_indicatorCircle"></i></span>
			</button>
			<MkA v-tooltip.noDelay.right="i18n.ts.settings" :class="$style.item" :activeClass="$style.active" to="/settings">
				<i :class="$style.itemIcon" class="ti ti-settings ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.settings }}</span>
			</MkA>
			<MkA v-tooltip.noDelay.right="i18n.ts._tms.taiymeFeatures" :class="$style.item" :activeClass="$style.active" to="/tms/features">
				<i :class="$style.itemIcon" class="ti ti-settings-plus ti-fw"></i><span :class="$style.itemText">{{ i18n.ts._tms.taiymeFeatures }}</span>
			</MkA>
		</div>
		<div :class="$style.bottom">
			<button v-tooltip.noDelay.right="i18n.ts.note" class="_button" :class="[$style.post]" data-cy-open-post-form @click="() => os.post()">
				<i class="ti ti-pencil ti-fw" :class="$style.postIcon"></i><span :class="$style.postText">{{ i18n.ts.note }}</span>
			</button>
			<div :class="$style.accountButton">
				<TmsAccountButton :iconOnly="iconOnly" tooltip/>
			</div>
		</div>
	</div>
	<button v-if="!forceIconOnly" class="_button" :class="$style.toggleButton" @click="toggleIconOnly">
		<svg viewBox="0 0 16 64" :class="$style.toggleButtonShape">
			<g transform="matrix(0.333333,0,0,0.222222,0.000895785,21.3333)">
				<path
					d="M47.488,7.995C47.79,10.11 47.943,12.266 47.943,14.429C47.997,26.989 47.997,84 47.997,84C47.997,84 44.018,118.246 23.997,133.5C-0.374,152.07 -0.003,192 -0.003,192L-0.003,-96C-0.003,-96 0.151,-56.216 23.997,-37.5C40.861,-24.265 46.043,-1.243 47.488,7.995Z"
					style="fill:var(--MI_THEME-navBg);"
				/>
			</g>
		</svg>
		<i :class="iconOnly ? 'ti ti-chevron-right' : 'ti ti-chevron-left'" style="font-size: 12px; margin-left: -8px;"></i>
	</button>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { getHTMLElementOrNull } from '@/scripts/get-dom-node-or-null.js';
import TmsAccountButton from '@/components/TmsAccountButton.vue';
import TmsServerLogo from '@/components/TmsServerLogo.vue';

const menu = computed(() => defaultStore.reactiveState.menu.value);
const otherMenuItemIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (menu.value.includes(def)) continue;
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

function more(ev: MouseEvent) {
	const target = getHTMLElementOrNull(ev.currentTarget ?? ev.target);
	if (target == null) return;

	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkLaunchPad.vue')), {
		src: target,
	}, {
		closed: () => dispose(),
	});
}

const forceIconOnly = ref(window.innerWidth <= 1279);
const iconOnly = computed(() => {
	return forceIconOnly.value || (defaultStore.reactiveState.menuDisplay.value === 'sideIcon');
});

window.addEventListener('resize', () => {
	forceIconOnly.value = window.innerWidth <= 1279;
}, { passive: true });

function toggleIconOnly() {
	defaultStore.set('menuDisplay', iconOnly.value ? 'sideFull' : 'sideIcon');
}
</script>

<style lang="scss" module>
.root {
	--nav-width: 250px;
	--nav-icon-only-width: 80px;
	--nav-bg-transparent: rgb(from var(--MI_THEME-navBg) r g b / 0.5);

	flex: 0 0 var(--nav-width);
	width: var(--nav-width);
	box-sizing: border-box;
}

.body {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1001;
	width: var(--nav-icon-only-width);
	height: 100dvh;
	box-sizing: border-box;
	overflow: auto;
	overflow-x: clip;
	overscroll-behavior: contain;
	background: var(--MI_THEME-navBg);
	contain: strict;
	display: flex;
	flex-direction: column;
	direction: rtl; // スクロールバーを左に表示したいため
}

.top {
	direction: ltr;
}

.middle {
	direction: ltr;
}

.bottom {
	direction: ltr;
}

.toggleButton {
	position: fixed;
	bottom: 20px;
	left: var(--nav-width);
	z-index: 1001;
	width: 16px;
	height: 64px;
	box-sizing: border-box;
}

.toggleButtonShape {
	position: absolute;
	z-index: -1;
	top: 0;
	left: 0;
	width: 16px;
	height: 64px;
}

.root:not(.iconOnly) {
	.body {
		width: var(--nav-width);
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--nav-bg-transparent);
		backdrop-filter: var(--MI-blur, blur(8px));
	}

	.serverLogo {
		--tmsServerLogo-padding: 20px 17px;
	}

	.bottom {
		position: sticky;
		bottom: 0;
		padding-top: 20px;
		background: var(--nav-bg-transparent);
		backdrop-filter: var(--MI-blur, blur(8px));
	}

	.post {
		position: relative;
		display: block;
		width: 100%;
		height: 40px;
		color: var(--MI_THEME-fgOnAccent);
		font-weight: bold;
		text-align: left;

		&::before {
			content: "";
			display: block;
			width: calc(100% - 38px);
			height: 100%;
			margin: auto;
			position: absolute;
			inset: 0;
			border-radius: 999px;
			background: linear-gradient(90deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--MI_THEME-fgOnAccent);
				outline-offset: -4px;
			}
		}

		&:hover, &.active {
			&::before {
				background: var(--MI_THEME-accentLighten);
			}
		}
	}

	.postIcon {
		position: relative;
		margin-left: 30px;
		margin-right: 8px;
		width: 32px;
	}

	.postText {
		position: relative;
	}

	.accountButton {
		--tmsAccountButton-padding: 20px 17px;
	}

	.middle {
		flex: 1;
	}

	.divider {
		margin: 16px 16px;
		border-top: solid 0.5px var(--MI_THEME-divider);
	}

	.item {
		position: relative;
		display: block;
		padding-left: 30px;
		line-height: 2.85rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 100%;
		text-align: left;
		box-sizing: border-box;
		color: var(--MI_THEME-navFg);

		&::before {
			content: "";
			display: block;
			width: calc(100% - 34px);
			height: 100%;
			margin: auto;
			position: absolute;
			inset: 0;
			border-radius: 999px;
			background: transparent;
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--MI_THEME-focus);
				outline-offset: -2px;
			}
		}

		&:hover, &.active {
			text-decoration: none;
			color: var(--MI_THEME-accent);

			&::before {
				background: var(--MI_THEME-accentedBg);
			}
		}
	}

	.itemIcon {
		position: relative;
		width: 32px;
		margin-right: 8px;
	}

	.itemIndicator {
		position: absolute;
		top: 0;
		left: 20px;
		color: var(--MI_THEME-navIndicator);
		font-size: 8px;

		&:has(.itemIndicateValueIcon) {
			animation: none;
			left: auto;
			right: 40px;
			font-size: 10px;
		}
	}

	.itemText {
		position: relative;
		font-size: 0.9em;
	}

	.toggleButton {
		left: var(--nav-width);
	}
}

.root.iconOnly {
	flex: 0 0 var(--nav-icon-only-width);
	width: var(--nav-icon-only-width);

	.body {
		width: var(--nav-icon-only-width);
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--nav-bg-transparent);
		backdrop-filter: var(--MI-blur, blur(8px));
	}

	.serverLogo {
		--tmsServerLogo-padding: 20px 0px;
	}

	.bottom {
		position: sticky;
		bottom: 0;
		padding-top: 20px;
		background: var(--nav-bg-transparent);
		backdrop-filter: var(--MI-blur, blur(8px));
	}

	.post {
		display: block;
		position: relative;
		width: 100%;
		height: 52px;
		text-align: center;

		&::before {
			content: "";
			display: block;
			position: absolute;
			inset: 0;
			margin: auto;
			width: 52px;
			aspect-ratio: 1 / 1;
			border-radius: 100%;
			background: linear-gradient(90deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--MI_THEME-fgOnAccent);
				outline-offset: -4px;
			}
		}

		&:hover, &.active {
			&::before {
				background: var(--MI_THEME-accentLighten);
			}
		}
	}

	.postIcon {
		position: relative;
		color: var(--MI_THEME-fgOnAccent);
	}

	.postText {
		display: none;
	}

	.accountButton {
		--tmsAccountButton-padding: 20px 0px;
	}

	.middle {
		flex: 1;
	}

	.divider {
		margin: 8px auto;
		width: calc(100% - 32px);
		border-top: solid 0.5px var(--MI_THEME-divider);
	}

	.item {
		display: block;
		position: relative;
		padding: 18px 0;
		width: 100%;
		text-align: center;

		&::before {
			content: "";
			display: block;
			height: 100%;
			aspect-ratio: 1 / 1;
			margin: auto;
			position: absolute;
			inset: 0;
			border-radius: 999px;
			background: transparent;
		}

		&:focus-visible {
			outline: none;

			&::before {
				outline: 2px solid var(--MI_THEME-focus);
				outline-offset: -2px;
			}
		}

		&:hover, &.active {
			text-decoration: none;
			color: var(--MI_THEME-accent);

			&::before {
				background: var(--MI_THEME-accentedBg);
			}

			> .icon,
			> .text {
				opacity: 1;
			}
		}
	}

	.itemIcon {
		display: block;
		margin: 0 auto;
		opacity: 0.7;
	}

	.itemText {
		display: none;
	}

	.itemIndicator {
		position: absolute;
		top: 6px;
		left: 24px;
		color: var(--MI_THEME-navIndicator);
		font-size: 8px;

		&:has(.itemIndicateValueIcon) {
			animation: none;
			top: 4px;
			left: auto;
			right: 4px;
			font-size: 10px;
		}
	}

	.toggleButton {
		left: var(--nav-icon-only-width);
	}
}
</style>
