<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
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
import { defineAsyncComponent, readonly, ref, watch } from 'vue';
import { commitHash, lang, version } from '@/config.js';
import { i18n } from '@/i18n.js';
import { miLocalStorage } from '@/local-storage.js';
import { confirm, popup, waiting } from '@/os.js';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';

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
	if (!(await confirmDialog())) return;
	waiting();
	const revision = commitHash ?? 'unknown';
	const newLocaleVersion = `${version}+REV:${revision}`;
	const res = await window.fetch(`/assets/locales/${lang}.${version}.json?date=${Date.now().toString()}`);
	if (res.status === 200) {
		const newLocale = await res.text();
		miLocalStorage.setItem('locale', newLocale);
		miLocalStorage.setItem('localeVersion', newLocaleVersion);
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
