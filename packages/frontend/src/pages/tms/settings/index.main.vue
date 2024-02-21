<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection>
		<div class="_gaps">
			<MkSwitch v-model="usePakuru">
				<template #label>{{ i18n.tsx._tms._settings.enableFeatureX({ x: i18n.ts._tms.pakuru }) }}</template>
				<template #caption>{{ i18n.tsx._tms._settings.addXToRenoteMenu({ x: i18n.ts._tms.pakuru }) }}</template>
			</MkSwitch>
			<MkSwitch v-model="useNumberquote">
				<template #label>{{ i18n.tsx._tms._settings.enableFeatureX({ x: i18n.ts._tms.numberquote }) }}</template>
				<template #caption>{{ i18n.tsx._tms._settings.addXToRenoteMenu({ x: i18n.ts._tms.numberquote }) }}</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, readonly, ref, watch } from 'vue';
import { i18n } from '@/i18n.js';
import { tmsStore } from '@/tms/store.js';
import FormSection from '@/components/form/section.vue';
import MkSwitch from '@/components/MkSwitch.vue';

//#region 即時変更
const usePakuru = computed(tmsStore.makeGetterSetter('usePakuru'));
const useNumberquote = computed(tmsStore.makeGetterSetter('useNumberquote'));
//#endregion

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
