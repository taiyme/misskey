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
			<template v-for="item in menu">
				<div v-if="item === '-'" :class="$style.divider"></div>
				<component
					:is="navbarItemDef[item].to ? 'MkA' : 'button'"
					v-else-if="navbarItemDef[item] && (navbarItemDef[item].show !== false)"
					v-tooltip.noDelay.right="navbarItemDef[item].title"
					class="_button"
					:class="[$style.item, { [$style.active]: navbarItemDef[item].active }]"
					:activeClass="$style.active"
					:to="navbarItemDef[item].to"
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
			<MkA v-if="$i.isAdmin || $i.isModerator" v-tooltip.noDelay.right="i18n.ts.controlPanel" :class="$style.item" :activeClass="$style.active" to="/admin">
				<i :class="$style.itemIcon" class="ti ti-dashboard ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.controlPanel }}</span>
			</MkA>
			<button class="_button" :class="$style.item" @click="more">
				<i :class="$style.itemIcon" class="ti ti-grid-dots ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.more }}</span>
				<span v-if="otherMenuItemIndicated" :class="$style.itemIndicator" class="_blink"><i class="_indicatorCircle"></i></span>
			</button>
			<MkA v-tooltip.noDelay.right="i18n.ts.settings" :class="$style.item" :activeClass="$style.active" to="/settings">
				<i :class="$style.itemIcon" class="ti ti-settings ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.settings }}</span>
			</MkA>
		</div>
		<div :class="$style.bottom">
			<button v-tooltip.noDelay.right="i18n.ts.note" class="_button" :class="[$style.post]" data-cy-open-post-form @click="os.post">
				<i class="ti ti-pencil ti-fw" :class="$style.postIcon"></i><span :class="$style.postText">{{ i18n.ts.note }}</span>
			</button>
			<div :class="$style.accountButton">
				<TmsAccountButton :iconOnly="iconOnly" tooltip/>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import TmsAccountButton from '@/components/TmsAccountButton.vue';
import TmsServerLogo from '@/components/TmsServerLogo.vue';

const iconOnly = ref(false);

const menu = computed(() => defaultStore.state.menu);
const otherMenuItemIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (menu.value.includes(def)) continue;
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

const calcViewState = () => {
	iconOnly.value = (window.innerWidth <= 1279) || (defaultStore.state.menuDisplay === 'sideIcon');
};

calcViewState();

window.addEventListener('resize', calcViewState, { passive: true });

watch(defaultStore.reactiveState.menuDisplay, () => {
	calcViewState();
});

function more(ev: MouseEvent) {
	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkLaunchPad.vue')), {
		src: ev.currentTarget ?? ev.target,
	}, {
		closed: () => dispose(),
	});
}
</script>

<style lang="scss" module>
.root {
	--nav-width: 250px;
	--nav-icon-only-width: 80px;
	--nav-bg-transparent: color(from var(--MI_THEME-navBg) srgb r g b / 0.5);

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
	overflow-x: hidden; // fallback (overflow-x: clip)
	overflow-x: clip;
	overscroll-behavior: contain;
	background: var(--MI_THEME-navBg);
	contain: strict;
	display: flex;
	flex-direction: column;
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
		-webkit-backdrop-filter: var(--MI-blur, blur(8px));
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
		-webkit-backdrop-filter: var(--MI-blur, blur(8px));
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
		-webkit-backdrop-filter: var(--MI-blur, blur(8px));
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
		-webkit-backdrop-filter: var(--MI-blur, blur(8px));
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
}
</style>
