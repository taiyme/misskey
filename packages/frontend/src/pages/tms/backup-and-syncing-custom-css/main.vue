<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<FormSection>
	<MkFolder>
		<template #label>カスタムCSSのバックアップと同期</template>
		<div class="_gaps_s">
			<FormSection first>
				<template #label>作成したバックアップ</template>
				<Backup ref="backup"/>
			</FormSection>
		</div>
	</MkFolder>
</FormSection>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef } from 'vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';

const Backup = defineAsyncComponent(() => import('@/pages/tms/backup-and-syncing-custom-css/backup.vue'));
const backup = shallowRef<InstanceType<typeof Backup> | null>(null);
</script>
