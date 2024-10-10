<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_s">
	<FormSection>
		<template #label>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.title }}</template>
		<XBackup ref="xBackup"/>
	</FormSection>

	<FormSection v-if="xBackup && xBackup.customCssBackups">
		<template #label>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._syncing.title }}</template>
		<div class="_gaps_m">
			<XSync ref="xSync" :customCssBackups="xBackup.customCssBackups"/>
			<template v-if="xSync && xSync.edited">
				<MkButton primary :disabled="!xSync.changed" @click="xSync.save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</template>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef } from 'vue';
import { i18n } from '@/i18n.js';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';

const XBackup = defineAsyncComponent(() => import('@/pages/tms/backup-and-syncing-custom-css/backup.vue'));
const xBackup = shallowRef<InstanceType<typeof XBackup> | null>(null);

const XSync = defineAsyncComponent(() => import('@/pages/tms/backup-and-syncing-custom-css/sync.vue'));
const xSync = shallowRef<InstanceType<typeof XSync> | null>(null);
</script>
