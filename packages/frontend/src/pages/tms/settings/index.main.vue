<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection>
		<template #label>{{ i18n.ts.appearance }}</template>
		<div class="_gaps">
			<MkSelect v-model="tickerPosition">
				<template #label>{{ i18n.ts._tms._settings._tickerPosition.label }}</template>
				<option value="default">{{ i18n.ts._tms._settings._tickerPosition.default }}</option>
				<option value="leftVerticalBar">{{ i18n.ts._tms._settings._tickerPosition.leftVerticalBar }}</option>
				<option value="rightVerticalBar">{{ i18n.ts._tms._settings._tickerPosition.rightVerticalBar }}</option>
				<option value="leftWatermark">{{ i18n.ts._tms._settings._tickerPosition.leftWatermark }}</option>
				<option value="rightWatermark">{{ i18n.ts._tms._settings._tickerPosition.rightWatermark }}</option>
			</MkSelect>
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
			<MkSwitch v-model="pullToRefreshAllReload">
				<template #label>{{ i18n.ts._tms._settings._pullToRefreshAllReload.label }}</template>
				<template #caption>{{ i18n.ts._tms._settings._pullToRefreshAllReload.caption }}</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, readonly, ref, watch } from 'vue';
import { i18n } from '@/i18n.js';
import { confirm } from '@/os.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { tmsStore } from '@/tms/store.js';
import FormSection from '@/components/form/section.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';

//#region 即時変更
const superMenuDisplayMode = computed(tmsStore.makeGetterSetter('superMenuDisplayMode'));
const pullToRefreshAllReload = computed(tmsStore.makeGetterSetter('pullToRefreshAllReload'));
//#endregion

//#region 即時変更 (ダイアログ付き)
const tickerPosition = computed({
	get: () => tmsStore.reactiveState.tickerPosition.value,
	set: (newValue) => {
		tmsStore.set('tickerPosition', newValue);
		reloadAsk();
	},
});
const pullToRefreshSensitivity = computed({
	get: () => tmsStore.reactiveState.pullToRefreshSensitivity.value,
	set: (newValue) => {
		tmsStore.set('pullToRefreshSensitivity', newValue);
		reloadAsk();
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
