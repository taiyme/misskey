<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<template #default>
		<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
			<div class="_gaps_m">
				<div class="_gaps_s">
					<MkInfo>{{ i18n.ts._tms._settings.description }}</MkInfo>
					<MkInfo>{{ i18n.ts._tms.reportIssuesToGithub }} <a href="https://github.com/taiyme/misskey/issues" target="_blank" class="_link">{{ i18n.ts.learnMore }}</a></MkInfo>
				</div>
				<FormSuspense :p="ready">
					<XMain ref="xMain"/>
				</FormSuspense>
				<div class="_buttonsCenter"><MkButton rounded small link to="/tms/flags"><i class="ti ti-flask"></i> {{ i18n.ts._tms.taiymeFlags }}</MkButton></div>
			</div>
		</MkSpacer>
	</template>
	<template v-if="xMain" #footer>
		<div v-show="xMain.edited" :class="$style.footer">
			<MkSpacer :contentMax="700" :marginMin="16" :marginMax="16">
				<MkButton primary rounded :disabled="!xMain.changed" @click="xMain.save()"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</MkSpacer>
		</div>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef } from 'vue';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { tmsFlaskStore } from '@/tms/flask-store.js';
import { tmsStore } from '@/tms/store.js';
import FormSuspense from '@/components/form/suspense.vue';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';

const ready = async (): Promise<void> => {
	await tmsStore.loaded;
	await tmsFlaskStore.loaded;
};

const XMain = defineAsyncComponent(() => import('@/pages/tms/settings/index.main.vue'));
const xMain = shallowRef<InstanceType<typeof XMain> | null>(null);

definePageMetadata(() => ({
	title: i18n.ts._tms._settings.title,
	icon: 'ti ti-settings',
}));
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--MI-blur, blur(15px));
	backdrop-filter: var(--MI-blur, blur(15px));
}
</style>
