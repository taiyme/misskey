<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div :class="$style.top">
		<div :class="$style.serverLogo">
			<TmsServerLogo/>
		</div>
	</div>
	<div :class="$style.middle">
		<MkA :class="$style.item" :activeClass="$style.active" to="/" exact>
			<i :class="$style.itemIcon" class="ti ti-home ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.timeline }}</span>
		</MkA>
		<template v-for="item in menu">
			<div v-if="item === '-'" :class="$style.divider"></div>
			<component :is="navbarItemDef[item].to ? 'MkA' : 'button'" v-else-if="navbarItemDef[item] && (navbarItemDef[item].show !== false)" class="_button" :class="[$style.item, { [$style.active]: navbarItemDef[item].active }]" :activeClass="$style.active" :to="navbarItemDef[item].to" v-on="navbarItemDef[item].action ? { click: navbarItemDef[item].action } : {}">
				<i class="ti-fw" :class="[$style.itemIcon, navbarItemDef[item].icon]"></i><span :class="$style.itemText">{{ navbarItemDef[item].title }}</span>
				<span v-if="navbarItemDef[item].indicated" :class="$style.itemIndicator" class="_blink">
					<span v-if="navbarItemDef[item].indicateValue" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ navbarItemDef[item].indicateValue }}</span>
					<i v-else class="_indicatorCircle"></i>
				</span>
			</component>
		</template>
		<div :class="$style.divider"></div>
		<MkA v-if="$i.isAdmin || $i.isModerator" :class="$style.item" :activeClass="$style.active" to="/admin">
			<i :class="$style.itemIcon" class="ti ti-dashboard ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.controlPanel }}</span>
		</MkA>
		<button :class="$style.item" class="_button" @click="more">
			<i :class="$style.itemIcon" class="ti ti-grid-dots ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.more }}</span>
			<span v-if="otherMenuItemIndicated" :class="$style.itemIndicator" class="_blink"><i class="_indicatorCircle"></i></span>
		</button>
		<MkA :class="$style.item" :activeClass="$style.active" to="/settings">
			<i :class="$style.itemIcon" class="ti ti-settings ti-fw"></i><span :class="$style.itemText">{{ i18n.ts.settings }}</span>
		</MkA>
	</div>
	<div :class="$style.bottom">
		<button class="_button" :class="$style.post" data-cy-open-post-form @click="os.post">
			<i :class="$style.postIcon" class="ti ti-pencil ti-fw"></i><span style="position: relative;">{{ i18n.ts.note }}</span>
		</button>
		<div :class="$style.accountButton">
			<TmsAccountButton/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, toRef } from 'vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import TmsAccountButton from '@/components/TmsAccountButton.vue';
import TmsServerLogo from '@/components/TmsServerLogo.vue';

const menu = toRef(defaultStore.state, 'menu');
const otherMenuItemIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (menu.value.includes(def)) continue;
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

function more() {
	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkLaunchPad.vue')), {}, {
		closed: () => dispose(),
	});
}
</script>

<style lang="scss" module>
.root {
	--nav-bg-transparent: color(from var(--MI_THEME-navBg) srgb r g b / 0.5);

	display: flex;
	flex-direction: column;
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
	--tmsServerLogo-padding: 20px 12px;
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
			outline: 2px solid var(--MI_THEME-focus);
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

.accountButton {
	--tmsAccountButton-padding: 20px 12px;
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
	padding-left: 24px;
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
		width: calc(100% - 24px);
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
		right: 20px;
	}
}

.itemText {
	position: relative;
	font-size: 0.9em;
}
</style>
