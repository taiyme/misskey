<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkHorizontalSwipe v-model:tab="tab" :tabs="headerTabs">
		<MkSpacer v-if="tab === 'overview'" :contentMax="600" :marginMin="20">
			<div class="_gaps_m">
				<TmsServerBanner/>

				<MkKeyValue>
					<template #key>{{ i18n.ts.description }}</template>
					<template #value><div v-html="instance.description || i18n.ts.headlineMisskey"></div></template>
				</MkKeyValue>

				<FormSection>
					<div class="_gaps_m">
						<TmsSoftwareVersions/>
						<div v-html="i18n.tsx._tms.poweredByTaiyme({ name: instance.name ?? host })"></div>
						<div class="_gaps_s">
							<FormLink to="/tms/about">
								<template #icon><i class="ti ti-info-circle"></i></template>
								<template #default>{{ i18n.ts._tms.aboutTaiyme }}</template>
							</FormLink>
							<TmsSoftwareRepository/>
						</div>
					</div>
				</FormSection>

				<FormSection>
					<div class="_gaps_m">
						<FormSplit>
							<MkKeyValue :copy="instance.maintainerName">
								<template #key>{{ i18n.ts.administrator }}</template>
								<template #value>
									<template v-if="instance.maintainerName">{{ instance.maintainerName }}</template>
									<span v-else style="opacity: 0.7;">({{ i18n.ts.notSet }})</span>
								</template>
							</MkKeyValue>
							<MkKeyValue :copy="instance.maintainerEmail">
								<template #key>{{ i18n.ts.contact }}</template>
								<template #value>
									<template v-if="instance.maintainerEmail">{{ instance.maintainerEmail }}</template>
									<span v-else style="opacity: 0.7;">({{ i18n.ts.notSet }})</span>
								</template>
							</MkKeyValue>
						</FormSplit>
						<div class="_gaps_s">
							<FormLink v-if="instance.impressumUrl" :to="instance.impressumUrl" external>
								<template #icon><i class="ti ti-user-shield"></i></template>
								<template #default>{{ i18n.ts.impressum }}</template>
							</FormLink>
							<MkFolder v-if="instance.serverRules.length > 0">
								<template #icon><i class="ti ti-checkup-list"></i></template>
								<template #label>{{ i18n.ts.serverRules }}</template>
								<ol class="_gaps_s" :class="$style.rules">
									<li v-for="(item, index) in instance.serverRules" :key="index" :class="$style.rule">
										<div :class="$style.ruleText" v-html="item"></div>
									</li>
								</ol>
							</MkFolder>
							<FormLink v-if="instance.tosUrl" :to="instance.tosUrl" external>
								<template #icon><i class="ti ti-license"></i></template>
								<template #default>{{ i18n.ts.termsOfService }}</template>
							</FormLink>
							<FormLink v-if="instance.privacyPolicyUrl" :to="instance.privacyPolicyUrl" external>
								<template #icon><i class="ti ti-shield-lock"></i></template>
								<template #default>{{ i18n.ts.privacyPolicy }}</template>
							</FormLink>
							<FormLink v-if="instance.feedbackUrl" :to="instance.feedbackUrl" external>
								<template #icon><i class="ti ti-message"></i></template>
								<template #default>{{ i18n.ts.feedback }}</template>
							</FormLink>
						</div>
					</div>
				</FormSection>

				<FormSuspense :p="initStats">
					<FormSection>
						<template #label>{{ i18n.ts.statistics }}</template>
						<FormSplit>
							<MkKeyValue>
								<template #key>{{ i18n.ts.users }}</template>
								<template #value>{{ number(stats.originalUsersCount) }}</template>
							</MkKeyValue>
							<MkKeyValue>
								<template #key>{{ i18n.ts.notes }}</template>
								<template #value>{{ number(stats.originalNotesCount) }}</template>
							</MkKeyValue>
						</FormSplit>
					</FormSection>
				</FormSuspense>

				<FormSection>
					<template #label>Well-known resources</template>
					<div class="_gaps_s">
						<FormLink to="/.well-known/host-meta" external>host-meta</FormLink>
						<FormLink to="/.well-known/host-meta.json" external>host-meta.json</FormLink>
						<FormLink to="/.well-known/nodeinfo" external>nodeinfo</FormLink>
						<FormLink to="/robots.txt" external>robots.txt</FormLink>
						<FormLink to="/manifest.json" external>manifest.json</FormLink>
					</div>
				</FormSection>
			</div>
		</MkSpacer>
		<MkSpacer v-else-if="tab === 'emojis'" :contentMax="1000" :marginMin="20">
			<XEmojis/>
		</MkSpacer>
		<MkSpacer v-else-if="tab === 'federation'" :contentMax="1000" :marginMin="20">
			<XFederation/>
		</MkSpacer>
		<MkSpacer v-else-if="tab === 'charts'" :contentMax="1000" :marginMin="20">
			<MkInstanceStats/>
		</MkSpacer>
	</MkHorizontalSwipe>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { host } from '@/config.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import number from '@/filters/number.js';
import { claimAchievement } from '@/scripts/achievements.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import FormSplit from '@/components/form/split.vue';
import FormSuspense from '@/components/form/suspense.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkHorizontalSwipe from '@/components/MkHorizontalSwipe.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import TmsServerBanner from '@/components/TmsServerBanner.vue';
import TmsSoftwareRepository from '@/components/TmsSoftwareRepository.vue';
import TmsSoftwareVersions from '@/components/TmsSoftwareVersions.vue';

const MkInstanceStats = defineAsyncComponent(() => import('@/components/MkInstanceStats.vue'));
const XEmojis = defineAsyncComponent(() => import('@/pages/about.emojis.vue'));
const XFederation = defineAsyncComponent(() => import('@/pages/about.federation.vue'));

const props = withDefaults(defineProps<{
	initialTab?: string;
}>(), {
	initialTab: 'overview',
});

const stats = ref<Misskey.entities.StatsResponse | null>(null);
const tab = ref(props.initialTab);

watch(tab, () => {
	if (tab.value === 'charts') {
		claimAchievement('viewInstanceChart');
	}
});

const initStats = () => misskeyApi('stats', {
}).then((res) => {
	stats.value = res;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'overview',
	title: i18n.ts.overview,
}, {
	key: 'emojis',
	title: i18n.ts.customEmojis,
	icon: 'ti ti-icons',
}, {
	key: 'federation',
	title: i18n.ts.federation,
	icon: 'ti ti-whirl',
}, {
	key: 'charts',
	title: i18n.ts.charts,
	icon: 'ti ti-chart-line',
}]);

definePageMetadata(() => ({
	title: i18n.ts.instanceInfo,
	icon: 'ti ti-info-circle',
}));
</script>

<style lang="scss" module>
.rules {
	counter-reset: item;
	list-style: none;
	padding: 0;
	margin: 0;
}

.rule {
	display: flex;
	gap: 8px;
	word-break: break-word;

	&::before {
		flex-shrink: 0;
		display: flex;
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 8px);
		counter-increment: item;
		content: counter(item);
		width: 32px;
		height: 32px;
		line-height: 32px;
		background-color: var(--accentedBg);
		color: var(--accent);
		font-size: 13px;
		font-weight: bold;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
	}
}

.ruleText {
	padding-top: 6px;
}
</style>
