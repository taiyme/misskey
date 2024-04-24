<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection>
		<template #label>{{ i18n.ts.appearance }}</template>
		<div class="_gaps">
			<MkSelect v-model="superMenuDisplayMode">
				<template #label>{{ i18n.ts._tms._settings._superMenuDisplayMode.label }}</template>
				<template #caption>{{ i18n.ts._tms._settings._superMenuDisplayMode.caption }}</template>
				<option value="default">{{ i18n.ts._tms._settings._superMenuDisplayMode.default }}</option>
				<option value="classic">{{ i18n.ts._tms._settings._superMenuDisplayMode.classic }}</option>
				<option value="forceList">{{ i18n.ts._tms._settings._superMenuDisplayMode.forceList }}</option>
			</MkSelect>
		</div>
	</FormSection>
	<FormSection>
		<template #label>{{ i18n.ts.operations }}</template>
		<div class="_gaps">
			<MkSelect v-model="pullToRefreshSensitivity">
				<template #label>{{ i18n.ts._tms._settings._pullToRefreshSensitivity.label }}</template>
				<template #caption>{{ i18n.ts._tms._settings._pullToRefreshSensitivity.caption }}</template>
				<option value="low">{{ i18n.ts._tms._settings._pullToRefreshSensitivity.low }}</option>
				<option value="middle">{{ i18n.ts._tms._settings._pullToRefreshSensitivity.middle }}</option>
				<option value="high">{{ i18n.ts._tms._settings._pullToRefreshSensitivity.high }}</option>
			</MkSelect>
		</div>
	</FormSection>
	<FormSection>
		<div class="_gaps">
			<MkSwitch v-model="enablePakuru">
				<template #label>{{ i18n.ts._tms._settings._pakuru.label }}</template>
				<template #caption>{{ i18n.ts._tms._settings._pakuru.caption }}</template>
			</MkSwitch>
			<MkSwitch v-model="enableNumberquote">
				<template #label>{{ i18n.ts._tms._settings._numberquote.label }}</template>
				<template #caption>{{ i18n.ts._tms._settings._numberquote.caption }}</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, readonly, ref, watch } from 'vue';
import { i18n } from '@/i18n.js';
import { alert, confirm } from '@/os.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { tmsStore } from '@/tms/store.js';
import FormSection from '@/components/form/section.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';

//#region 即時変更
const superMenuDisplayMode = computed(tmsStore.makeGetterSetter('superMenuDisplayMode'));
//#endregion

//#region 即時変更 (ダイアログ付き)
const pullToRefreshSensitivity = computed({
	get: () => tmsStore.reactiveState.pullToRefreshSensitivity.value,
	set: (newValue) => {
		tmsStore.set('pullToRefreshSensitivity', newValue);
		reloadAsk();
	},
});
const enablePakuru = computed({
	get: () => tmsStore.reactiveState.enablePakuru.value,
	set: async (newValue) => {
		if (!enablePakuru.value && newValue) { // false -> true
			await alert({
				type: 'warning',
				text: i18n.ts._tms._settings._pakuru.warning,
			});
		}
		tmsStore.set('enablePakuru', newValue);
	},
});
const enableNumberquote = computed({
	get: () => tmsStore.reactiveState.enableNumberquote.value,
	set: async (newValue) => {
		if (!enableNumberquote.value && newValue) { // false -> true
			await alert({
				type: 'warning',
				text: i18n.ts._tms._settings._numberquote.warning,
			});
		}
		tmsStore.set('enableNumberquote', newValue);
	},
});
//#endregion

const reloadAsk = async (): Promise<void> => {
	const { canceled } = await confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
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
