<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<div class="_gaps_s">
		<MkSwitch v-model="enabled">{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._syncing.enable }}</MkSwitch>
		<MkInfo>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._syncing.description }}</MkInfo>
	</div>

	<template v-if="enabled">
		<div class="_gaps_s">
			<MkInfo>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._syncing.selectDescription }}</MkInfo>
			<MkSelect v-model="selected">
				<template #label>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._syncing.select }}</template>
				<option v-for="backup in customCssBackups" :key="backup.id" :value="backup.id">{{ backup.name }}</option>
			</MkSelect>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { readonly, ref, watch } from 'vue';
import type { CustomCSSBackup, CustomCSSBackups } from './backup.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import { tmsFlaskStore } from '@/tms/flask-store.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { i18n } from '@/i18n.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { miLocalStorage } from '@/local-storage.js';

defineProps<{
	customCssBackups: CustomCSSBackups;
}>();

const scope = ['tms', 'customCssBackups'] as const satisfies string[];

const edited = ref(false);
const changed = ref(false);

const enabled = ref(tmsFlaskStore.state.enabledCustomCssSyncing);
const selected = ref(tmsFlaskStore.state.syncingCustomCssId);

const save = async (): Promise<void> => {
	if (!changed.value) return;
	changed.value = false;

	tmsFlaskStore.set('enabledCustomCssSyncing', enabled.value);
	tmsFlaskStore.set('syncingCustomCssId', enabled.value ? selected.value : null);

	if (enabled.value && selected.value) {
		const customCss = await misskeyApi('i/registry/get', {
			scope,
			key: selected.value,
		}) as CustomCSSBackup | null;
		miLocalStorage.setItem('customCss', customCss ? customCss.customCss : '');
	}

	unisonReload();
};

watch([
	enabled,
	selected,
], () => {
	edited.value = true;
	changed.value = tmsFlaskStore.state.enabledCustomCssSyncing !== enabled.value || tmsFlaskStore.state.syncingCustomCssId !== selected.value;
}, { deep: true });

defineExpose({
	save,
	edited: readonly(edited),
	changed: readonly(changed),
});
</script>
