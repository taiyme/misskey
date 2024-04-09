<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<XBackupAndSyncingCustomCss ref="backupAndSyncingCustomCss"/>
	<FormSection>
		<template #label>For developer</template>
		<div class="_gaps_s">
			<MkFolder defaultOpen>
				<template #label>ForceFetchX</template>
				<div class="_buttons">
					<MkButton @click="forceFetchLocale">{{ i18n.tsx._tms._flags.forceFetchX({ x: `${lang}.${version}.json` }) }}</MkButton>
				</div>
			</MkFolder>
			<MkFolder defaultOpen>
				<template #label>OpenX</template>
				<div class="_buttons">
					<MkButton @click="openMkUpdated">{{ i18n.tsx._tms._flags.openX({ x: 'MkUpdated' }) }}</MkButton>
					<MkButton @click="openMkDonation">{{ i18n.tsx._tms._flags.openX({ x: 'MkDonation' }) }}</MkButton>
				</div>
			</MkFolder>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, readonly, ref, shallowRef, watch } from 'vue';
import { commitHash, lang, version } from '@/config.js';
import { i18n } from '@/i18n.js';
import { miLocalStorage } from '@/local-storage.js';
import { confirm, inputText, popup, waiting } from '@/os.js';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';

const XBackupAndSyncingCustomCss = defineAsyncComponent(() => import('@/pages/tms/backup-and-syncing-custom-css/main.vue'));
const backupAndSyncingCustomCss = shallowRef<InstanceType<typeof XBackupAndSyncingCustomCss> | null>(null);

const confirmDialog = async (): Promise<boolean> => {
	const { canceled } = await confirm({
		type: 'info',
		text: 'Execute?',
		okText: 'Yes',
		cancelText: 'No',
	});
	return !canceled;
};

const forceFetchLocale = async (): Promise<void> => {
	const defaultValue = commitHash ?? Date.now().toString();
	const { canceled, result } = await inputText({
		type: 'text',
		text: 'Revision?',
		placeholder: defaultValue,
		default: defaultValue,
	});
	if (canceled) return;
	if (!(await confirmDialog())) return;
	waiting();
	const revision = result || defaultValue;
	const res = await window.fetch(`/assets/locales/${lang}.${version}.json?rev=${revision}`);
	if (res.status === 200) {
		const newLocale = await res.text();
		miLocalStorage.setItem('locale', newLocale);
		miLocalStorage.setItem('localeVersion', version);
	}
	location.reload();
};

const openMkUpdated = async (): Promise<void> => {
	if (!(await confirmDialog())) return;
	popup(defineAsyncComponent(() => import('@/components/MkUpdated.vue')), {}, {}, 'closed');
};

const openMkDonation = async (): Promise<void> => {
	if (!(await confirmDialog())) return;
	popup(defineAsyncComponent(() => import('@/components/MkDonation.vue')), {}, {}, 'closed');
};

const edited = ref(false);
const changed = ref(false);

watch([
], () => {
	edited.value = true;
	changed.value = true;
}, { deep: true });

const save = (): void => {
	if (!changed.value) return;
	changed.value = false;
};

defineExpose({
	save,
	edited: readonly(edited),
	changed: readonly(changed),
});
</script>
