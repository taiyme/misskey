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
						<div>
							<img :src="instance.iconUrl || '/favicon.ico'" alt="" :class="$style.serverIcon"/>
						</div>

						<div :class="[$style.navInfoList, '_gaps_s']">
							<MkInfo v-if="thereIsUnresolvedAbuseReport" warn>{{ i18n.ts.thereIsUnresolvedAbuseReportWarning }} <MkA to="/admin/abuses" class="_link">{{ i18n.ts.check }}</MkA></MkInfo>
							<MkInfo v-if="noMaintainerInformation" warn>{{ i18n.ts.noMaintainerInformationWarning }} <MkA to="/admin/settings" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
							<MkInfo v-if="noInquiryUrl" warn>{{ i18n.ts.noInquiryUrlWarning }} <MkA to="/admin/settings" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
							<MkInfo v-if="noBotProtection" warn>{{ i18n.ts.noBotProtectionWarning }} <MkA to="/admin/security" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
							<MkInfo v-if="noEmailServer" warn>{{ i18n.ts.noEmailServerWarning }} <MkA to="/admin/email-settings" class="_link">{{ i18n.ts.configure }}</MkA></MkInfo>
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
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import * as os from '@/os.js';
import { lookupUser, lookupUserByEmail, lookupFile } from '@/scripts/admin-lookup.js';
import { lookup } from '@/scripts/lookup.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { definePageMetadata, useRoutingPageMetadata } from '@/scripts/page-metadata.js';
import { useRouter } from '@/router/supplier.js';
import MkInfo from '@/components/MkInfo.vue';
import TmsSuperMenu from '@/components/TmsSuperMenu.vue';
import { type ISuperMenuDefinitions } from '@/components/TmsSuperMenu.impl.js';

const ROOT_PAGE_PATH = '/admin' as const;
const INITIAL_PAGE_PATH = '/admin/overview' as const;

//#region admin info
const isEmpty = (x: string | null | undefined) => x == null || x === '';

const thereIsUnresolvedAbuseReport = ref(false);
onMounted(() => {
	misskeyApi('admin/abuse-user-reports', {
		state: 'unresolved',
		limit: 1,
	}).then(reports => {
		if (reports.length > 0) {
			thereIsUnresolvedAbuseReport.value = true;
		}
	});
});
const noMaintainerInformation = computed(() => isEmpty(instance.maintainerName) || isEmpty(instance.maintainerEmail));
const noInquiryUrl = computed(() => isEmpty(instance.inquiryUrl));
const noBotProtection = computed(() => !instance.disableRegistration && !instance.enableHcaptcha && !instance.enableRecaptcha && !instance.enableTurnstile && !instance.enableMcaptcha);
const noEmailServer = computed(() => !instance.enableEmail);
//#endregion

//#region admin routing
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
		title: i18n.ts.controlPanel,
		icon: 'ti ti-settings',
	};
});
//#endregion

//#region admin menuDef
function invite() {
	misskeyApi('admin/invite/create').then(x => {
		os.alert({
			type: 'info',
			text: x[0].code,
		});
	}).catch(err => {
		os.alert({
			type: 'error',
			text: err,
		});
	});
}

function adminLookup(ev: MouseEvent) {
	os.popupMenu([{
		text: i18n.ts.user,
		icon: 'ti ti-user',
		action: () => {
			lookupUser();
		},
	}, {
		text: `${i18n.ts.user} (${i18n.ts.email})`,
		icon: 'ti ti-user',
		action: () => {
			lookupUserByEmail();
		},
	}, {
		text: i18n.ts.file,
		icon: 'ti ti-cloud',
		action: () => {
			lookupFile();
		},
	}, {
		text: i18n.ts.lookup,
		icon: 'ti ti-world-search',
		action: () => {
			lookup();
		},
	}], ev.currentTarget ?? ev.target);
}

const menuDef = computed(() => [
	{
		title: i18n.ts.quickAction,
		items: [{
			type: 'button' as const,
			icon: 'ti ti-search',
			text: i18n.ts.lookup,
			action: adminLookup,
		}, ...(instance.disableRegistration ? [{
			type: 'button' as const,
			icon: 'ti ti-user-plus',
			text: i18n.ts.createInviteCode,
			action: invite,
		}] : [])],
	},
	{
		title: i18n.ts.administration,
		items: [{
			icon: 'ti ti-dashboard',
			text: i18n.ts.dashboard,
			to: '/admin/overview',
			active: childPage.value?.route.name === 'overview',
		}, {
			icon: 'ti ti-users',
			text: i18n.ts.users,
			to: '/admin/users',
			active: childPage.value?.route.name === 'users',
		}, {
			icon: 'ti ti-user-plus',
			text: i18n.ts.invite,
			to: '/admin/invites',
			active: childPage.value?.route.name === 'invites',
		}, {
			icon: 'ti ti-badges',
			text: i18n.ts.roles,
			to: '/admin/roles',
			active: childPage.value?.route.name === 'roles',
		}, {
			icon: 'ti ti-icons',
			text: i18n.ts.customEmojis,
			to: '/admin/emojis',
			active: childPage.value?.route.name === 'emojis',
		}, {
			icon: 'ti ti-icons',
			text: i18n.ts.customEmojis + '(beta)',
			to: '/admin/emojis2',
			active: childPage.value?.route.name === 'emojis2',
		}, {
			icon: 'ti ti-sparkles',
			text: i18n.ts.avatarDecorations,
			to: '/admin/avatar-decorations',
			active: childPage.value?.route.name === 'avatarDecorations',
		}, {
			icon: 'ti ti-whirl',
			text: i18n.ts.federation,
			to: '/admin/federation',
			active: childPage.value?.route.name === 'federation',
		}, {
			icon: 'ti ti-clock-play',
			text: i18n.ts.jobQueue,
			to: '/admin/queue',
			active: childPage.value?.route.name === 'queue',
		}, {
			icon: 'ti ti-cloud',
			text: i18n.ts.files,
			to: '/admin/files',
			active: childPage.value?.route.name === 'files',
		}, {
			icon: 'ti ti-speakerphone',
			text: i18n.ts.announcements,
			to: '/admin/announcements',
			active: childPage.value?.route.name === 'announcements',
		}, {
			icon: 'ti ti-ad',
			text: i18n.ts.ads,
			to: '/admin/ads',
			active: childPage.value?.route.name === 'ads',
		}, {
			icon: 'ti ti-exclamation-circle',
			text: i18n.ts.abuseReports,
			to: '/admin/abuses',
			active: childPage.value?.route.name === 'abuses',
		}, {
			icon: 'ti ti-list-search',
			text: i18n.ts.moderationLogs,
			to: '/admin/modlog',
			active: childPage.value?.route.name === 'modlog',
		}],
	},
	{
		title: i18n.ts.settings,
		items: [{
			icon: 'ti ti-settings',
			text: i18n.ts.general,
			to: '/admin/settings',
			active: childPage.value?.route.name === 'settings',
		}, {
			icon: 'ti ti-paint',
			text: i18n.ts.branding,
			to: '/admin/branding',
			active: childPage.value?.route.name === 'branding',
		}, {
			icon: 'ti ti-shield',
			text: i18n.ts.moderation,
			to: '/admin/moderation',
			active: childPage.value?.route.name === 'moderation',
		}, {
			icon: 'ti ti-mail',
			text: i18n.ts.emailServer,
			to: '/admin/email-settings',
			active: childPage.value?.route.name === 'email-settings',
		}, {
			icon: 'ti ti-cloud',
			text: i18n.ts.objectStorage,
			to: '/admin/object-storage',
			active: childPage.value?.route.name === 'object-storage',
		}, {
			icon: 'ti ti-lock',
			text: i18n.ts.security,
			to: '/admin/security',
			active: childPage.value?.route.name === 'security',
		}, {
			icon: 'ti ti-planet',
			text: i18n.ts.relays,
			to: '/admin/relays',
			active: childPage.value?.route.name === 'relays',
		}, {
			icon: 'ti ti-link',
			text: i18n.ts.externalServices,
			to: '/admin/external-services',
			active: childPage.value?.route.name === 'external-services',
		}, {
			icon: 'ti ti-webhook',
			text: 'Webhook',
			to: '/admin/system-webhook',
			active: childPage.value?.route.name === 'system-webhook',
		}, {
			icon: 'ti ti-bolt',
			text: i18n.ts.performance,
			to: '/admin/performance',
			active: childPage.value?.route.name === 'performance',
		}],
	},
	{
		title: i18n.ts.info,
		items: [{
			icon: 'ti ti-database',
			text: i18n.ts.database,
			to: '/admin/database',
			active: childPage.value?.route.name === 'database',
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

.serverIcon {
	display: block;
	margin: auto;
	height: 42px;
	border-radius: 8px;
}
</style>
