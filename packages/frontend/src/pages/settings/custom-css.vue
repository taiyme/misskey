<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="900">
		<div class="_gaps_m">
			<FormInfo warn>{{ i18n.ts.customCssWarn }}</FormInfo>

			<MkCodeEditor v-model="localCustomCss" manualSave lang="css">
				<template #label>CSS</template>
			</MkCodeEditor>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import type { CustomCSSBackup } from '../tms/backup-and-syncing-custom-css/backup.vue';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import FormInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { miLocalStorage } from '@/local-storage.js';
import { tmsFlaskStore } from '@/tms/flask-store.js';
import { misskeyApi } from '@/scripts/misskey-api.js';

const localCustomCss = ref(miLocalStorage.getItem('customCss') ?? '');

const enabledCustomCssSyncing = ref(tmsFlaskStore.state.enabledCustomCssSyncing);
const syncingCustomCssId = ref(tmsFlaskStore.state.syncingCustomCssId);

async function apply() {
	miLocalStorage.setItem('customCss', localCustomCss.value);

	if (enabledCustomCssSyncing.value && syncingCustomCssId.value) {
		const scope = ['tms', 'customCssBackups'] as const satisfies string[];
		const backup = await misskeyApi('i/registry/get', {
			scope,
			key: syncingCustomCssId.value,
		}) as CustomCSSBackup | null;
		if (!backup) return;

		backup.customCss = localCustomCss.value;

		await os.apiWithDialog('i/registry/set', {
			scope,
			key: syncingCustomCssId.value,
			value: backup,
		});
	} else {
		const { canceled } = await os.confirm({
			type: 'info',
			text: i18n.ts.reloadToApplySetting,
		});
		if (canceled) return;

		unisonReload();
	}
}

watch(localCustomCss, async () => {
	await apply();
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.customCss,
	icon: 'ti ti-code',
}));
</script>
