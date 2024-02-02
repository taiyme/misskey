<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<template #default>
		<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
			<div class="_gaps_m">
				<TmsSoftwareVersions/>
				<div class="_gaps_s">
					<MkInfo>{{ i18n.ts._tms._flags.description }}</MkInfo>
					<MkInfo warn>{{ i18n.tsx._tms._flags.warning({ name: instance.name ?? host }) }}</MkInfo>
					<MkInfo>{{ i18n.ts._tms.reportIssuesToGithub }} <a href="https://github.com/taiyme/misskey/issues" target="_blank" class="_link">{{ i18n.ts.learnMore }}</a></MkInfo>
				</div>
				<XBackupAndSyncingCustomCss ref="backupAndSyncingCustomCss"/>
				<XMain ref="xMain"/>
				<div class="_buttonsCenter"><MkButton rounded small link to="/tms/settings"><i class="ti ti-settings"></i> {{ i18n.ts._tms.taiymeSettings }}</MkButton></div>
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
import { host } from '@/config.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import TmsSoftwareVersions from '@/components/TmsSoftwareVersions.vue';

const XMain = defineAsyncComponent(() => import('@/pages/tms/flags.main.vue'));
const xMain = shallowRef<InstanceType<typeof XMain> | null>(null);

const XBackupAndSyncingCustomCss = defineAsyncComponent(() => import('@/pages/tms/backup-and-syncing-custom-css/main.vue'));
const backupAndSyncingCustomCss = shallowRef<InstanceType<typeof XBackupAndSyncingCustomCss> | null>(null);

definePageMetadata(() => ({
	title: i18n.ts._tms._flags.title,
	icon: 'ti ti-flask',
}));
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}
</style>
