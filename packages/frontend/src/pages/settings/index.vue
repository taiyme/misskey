<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-if="childPage == null && !isWide"/></template>
	<template #default>
		<div ref="rootEl" :class="[$style.root, { [$style.wide]: isWide }]">
			<div v-if="showNav" :class="$style.navRoot">
				<MkSpacer :contentMax="700" :marginMin="16">
					<div class="_gaps_m">
						<div :class="[$style.navInfoList, '_gaps_s']">
							<MkInfo v-if="emailNotConfigured" warn>{{ i18n.ts.emailNotConfiguredWarning }} <MkA to="/settings/email" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
						</div>

						<TmsSuperMenu :def="menuDef" :wideMode="isWide"/>
					</div>
				</MkSpacer>
			</div>
			<div v-if="showMain" :class="$style.mainRoot">
				<div style="container-type: inline-size;">
					<RouterView nested/>
				</div>
			</div>
		</div>
		<MkFooterSpacer v-if="!isWide"/>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { signinRequired, signout } from '@/account.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import * as os from '@/os.js';
import { clearCache } from '@/scripts/clear-cache.js';
import { definePageMetadata, useRoutingPageMetadata } from '@/scripts/page-metadata.js';
import { useRouter } from '@/router/supplier.js';
import MkInfo from '@/components/MkInfo.vue';
import TmsSuperMenu from '@/components/TmsSuperMenu.vue';
import { type ISuperMenuDefinitions } from '@/components/TmsSuperMenu.impl.js';

const $i = signinRequired();

const ROOT_PAGE_PATH = '/settings' as const;
const INITIAL_PAGE_PATH = '/settings/profile' as const;

//#region settings info
const emailNotConfigured = computed(() => instance.enableEmail && ($i.email == null || !$i.emailVerified));
//#endregion

//#region settings routing
const { routingPageMetadataRef } = useRoutingPageMetadata();

const rootEl = useTemplateRef('rootEl');

const router = useRouter();

const childPage = computed(() => {
	if (router.currentRef.value.route.path !== ROOT_PAGE_PATH) return null;
	if (router.currentRef.value.child?.route.name === '_empty_') return null;
	return router.currentRef.value.child ?? null;
});

const isWide = ref(false);
const WIDE_THRESHOLD = 600 as const;

const ro = new ResizeObserver((entries) => {
	const inlineSize = entries.at(0)?.borderBoxSize.at(0)?.inlineSize ?? 0;
	if (inlineSize === 0) return;
	isWide.value = inlineSize >= WIDE_THRESHOLD;
});

onMounted(() => {
	if (rootEl.value != null) {
		ro.observe(rootEl.value);
	}
});

onUnmounted(() => {
	ro.disconnect();
});

watch([router.currentRef, isWide], ([current, wide]) => {
	if (!wide) return;
	if (current.route.path !== ROOT_PAGE_PATH) return;
	if (current.child == null || current.child.route.name === '_empty_') {
		router.replace(INITIAL_PAGE_PATH);
	}
});

const showNav = computed(() => {
	if (childPage.value != null) {
		return isWide.value;
	}
	return true;
});

const showMain = computed(() => {
	if (childPage.value != null) {
		return true;
	}
	return isWide.value;
});

definePageMetadata(() => {
	if (childPage.value != null && routingPageMetadataRef.value != null) {
		return {
			...routingPageMetadataRef.value,
		};
	}
	return {
		title: i18n.ts.settings,
		icon: 'ti ti-settings',
	};
});
//#endregion

//#region settings menuDef
const menuDef = computed(() => [
	{
		title: i18n.ts.basicSettings,
		items: [{
			icon: 'ti ti-user',
			text: i18n.ts.profile,
			to: '/settings/profile',
			active: childPage.value?.route.name === 'profile',
		}, {
			icon: 'ti ti-lock-open',
			text: i18n.ts.privacy,
			to: '/settings/privacy',
			active: childPage.value?.route.name === 'privacy',
		}, {
			icon: 'ti ti-mood-happy',
			text: i18n.ts.emojiPicker,
			to: '/settings/emoji-picker',
			active: childPage.value?.route.name === 'emojiPicker',
		}, {
			icon: 'ti ti-cloud',
			text: i18n.ts.drive,
			to: '/settings/drive',
			active: childPage.value?.route.name === 'drive',
		}, {
			icon: 'ti ti-bell',
			text: i18n.ts.notifications,
			to: '/settings/notifications',
			active: childPage.value?.route.name === 'notifications',
		}, {
			icon: 'ti ti-mail',
			text: i18n.ts.email,
			to: '/settings/email',
			active: childPage.value?.route.name === 'email',
		}, {
			icon: 'ti ti-lock',
			text: i18n.ts.security,
			to: '/settings/security',
			active: childPage.value?.route.name === 'security',
		}],
	},
	{
		title: i18n.ts.clientSettings,
		items: [{
			icon: 'ti ti-adjustments',
			text: i18n.ts.general,
			to: '/settings/general',
			active: childPage.value?.route.name === 'general',
		}, {
			icon: 'ti ti-palette',
			text: i18n.ts.theme,
			to: '/settings/theme',
			active: childPage.value?.route.name === 'theme',
		}, {
			icon: 'ti ti-menu-2',
			text: i18n.ts.navbar,
			to: '/settings/navbar',
			active: childPage.value?.route.name === 'navbar',
		}, {
			icon: 'ti ti-equal-double',
			text: i18n.ts.statusbar,
			to: '/settings/statusbar',
			active: childPage.value?.route.name === 'statusbar',
		}, {
			icon: 'ti ti-music',
			text: i18n.ts.sounds,
			to: '/settings/sounds',
			active: childPage.value?.route.name === 'sounds',
		}, {
			icon: 'ti ti-plug',
			text: i18n.ts.plugins,
			to: '/settings/plugin',
			active: childPage.value?.route.name === 'plugin',
		}],
	},
	{
		title: i18n.ts.otherSettings,
		items: [{
			icon: 'ti ti-badges',
			text: i18n.ts.roles,
			to: '/settings/roles',
			active: childPage.value?.route.name === 'roles',
		}, {
			icon: 'ti ti-ban',
			text: i18n.ts.muteAndBlock,
			to: '/settings/mute-block',
			active: childPage.value?.route.name === 'mute-block',
		}, {
			icon: 'ti ti-api',
			text: 'API',
			to: '/settings/api',
			active: childPage.value?.route.name === 'api',
		}, {
			icon: 'ti ti-webhook',
			text: 'Webhook',
			to: '/settings/webhook',
			active: childPage.value?.route.name === 'webhook',
		}, {
			icon: 'ti ti-package',
			text: i18n.ts.importAndExport,
			to: '/settings/import-export',
			active: childPage.value?.route.name === 'import-export',
		}, {
			icon: 'ti ti-plane',
			text: `${i18n.ts.accountMigration}`,
			to: '/settings/migration',
			active: childPage.value?.route.name === 'migration',
		}, {
			icon: 'ti ti-dots',
			text: i18n.ts.other,
			to: '/settings/other',
			active: childPage.value?.route.name === 'other',
		}],
	},
	{
		items: [{
			icon: 'ti ti-device-floppy',
			text: i18n.ts.preferencesBackups,
			to: '/settings/preferences-backups',
			active: childPage.value?.route.name === 'preferences-backups',
		}, {
			type: 'button' as const,
			icon: 'ti ti-trash',
			text: i18n.ts.clearCache,
			action: async () => {
				await clearCache();
			},
		}, {
			type: 'button' as const,
			icon: 'ti ti-power',
			text: i18n.ts.logout,
			action: async () => {
				const { canceled } = await os.confirm({
					type: 'warning',
					text: i18n.ts.logoutConfirm,
				});
				if (canceled) return;
				signout();
			},
			danger: true,
		}],
	},
] as const satisfies ISuperMenuDefinitions);
//#endregion
</script>

<style lang="scss" module>
.root {
	&.wide {
		height: 100%;
		margin: 0 auto;
		display: flex;
		box-sizing: border-box;

		@supports (height: 100cqh) {
			height: 100cqh;
			overflow: clip;
			contain: strict;
		}

		> .navRoot {
			width: 32%;
			height: 100%;
			max-width: 280px;
			overflow: auto;
			border-right: solid 0.5px var(--MI_THEME-divider);
			box-sizing: border-box;

			@supports (height: 100cqh) {
				overflow-y: scroll;
				overscroll-behavior: contain;
			}
		}

		> .mainRoot {
			flex: 1;
			min-width: 0;
			height: 100%;
			overflow: auto;
			box-sizing: border-box;

			@supports (height: 100cqh) {
				overflow-y: scroll;
				overscroll-behavior: contain;
			}
		}
	}
}

.navInfoList {
	&:empty {
		display: none;
	}
}
</style>
