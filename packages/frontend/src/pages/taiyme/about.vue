<!--
SPDX-FileCopyrightText: Copyright (c) 2026 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div style="overflow: clip;">
		<div class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 20px;">
			<div class="_gaps_m">
				<XEasterEgg/>

				<div style="text-align: center; word-break: auto-phrase;">
					{{ i18n.ts._taiyme._about.descriptionOfTaiyme }}
				</div>

				<FormSection>
					<div class="_gaps_s">
						<FormLink to="https://github.com/taiyme/misskey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts.sourceCode }}
						</FormLink>
						<FormLink to="https://taiy.me/to/donate" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ i18n.ts._taiyme.supportTaiy }}
						</FormLink>
					</div>
				</FormSection>

				<FormSection v-if="projectMembers.length > 0">
					<template #label>{{ i18n.ts._aboutMisskey.projectMembers }}</template>
					<FormSplit :minWidth="200">
						<template v-for="member in projectMembers" :key="member.name">
							<TmsMemberCard
								:name="member.name"
								:href="member.href"
								:iconUrl="member.iconUrl"
							/>
						</template>
					</FormSplit>
				</FormSection>

				<FormSection v-if="projectPatrons.length > 0">
					<template #label>{{ i18n.ts._aboutMisskey.patrons }}</template>
					<FormSplit :minWidth="180">
						<template v-for="patron in projectPatrons" :key="patron.name">
							<div>{{ patron.name }}</div>
						</template>
					</FormSplit>
				</FormSection>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { projectMembers, projectPatrons } from '@@/js/project-members.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import XEasterEgg from '@/pages/taiyme/about.easter-egg.vue';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import FormSplit from '@/components/form/split.vue';
import TmsMemberCard from '@/components/TmsMemberCard.vue';

definePage(() => ({
	title: i18n.ts._taiyme._about.aboutTaiyme,
	icon: 'ti ti-info-circle',
}));
</script>
