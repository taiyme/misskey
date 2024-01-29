<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<template #default>
		<MkSpacer :contentMax="600" :marginMin="20">
			<div class="_gaps_m">
				<TmsNoCache><TmsSoftwareBanner/></TmsNoCache>
				<div style="text-align: center;">
					{{ i18n.ts._tms._about.description }}
				</div>
				<FormSection>
					<FormSplit :minWidth="200">
						<FormLink to="https://github.com/taiyme/misskey" external>
							<template #icon><i class="ti ti-code"></i></template>
							<template #default>{{ i18n.ts._tms._about.source }}</template>
						</FormLink>
						<FormLink to="https://u.taiy.me/donate" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							<template #default>{{ i18n.ts._tms._about.donate }}</template>
						</FormLink>
					</FormSplit>
				</FormSection>
				<FormSection v-if="projectMembers.length > 0">
					<template #label>{{ i18n.ts._tms._about.projectMembers }}</template>
					<FormSplit :minWidth="200">
						<TmsMemberCard
							v-for="member in projectMembers"
							:key="member.name"
							:member="member"
						/>
					</FormSplit>
				</FormSection>
				<FormSection v-if="contributors.length > 0">
					<template #label>{{ i18n.ts._tms._about.contributors }}</template>
					<FormSplit :minWidth="200">
						<TmsMemberCard
							v-for="member in contributors"
							:key="member.name"
							:member="member"
						/>
					</FormSplit>
				</FormSection>
				<FormSection v-if="patrons.length > 0">
					<template #label>{{ i18n.ts._tms._about.patrons }}</template>
					<FormSplit :minWidth="180">
						<div v-for="patron in patrons" :key="patron">{{ patron }}</div>
					</FormSplit>
				</FormSection>
			</div>
		</MkSpacer>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { contributors, patrons, projectMembers } from '@/tms/contributors.js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import FormSplit from '@/components/form/split.vue';
import TmsMemberCard from '@/components/TmsMemberCard.vue';
import TmsSoftwareBanner from '@/components/TmsSoftwareBanner.vue';

definePageMetadata(() => ({
	title: i18n.ts._tms._about.title,
	icon: 'ti ti-info-circle',
}));
</script>
