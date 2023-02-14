<template>
<div class="_formRoot">
	<FormSection>
		<MkKeyValue class="_formBlock" :copy="version">
			<template #key>{{ i18n.ts.version }}</template>
			<template #value>{{ version }}</template>
		</MkKeyValue>
	</FormSection>
	<FormSection>
		<FormSwitch v-model="tmsVerticalInstanceTicker" class="_formBlock">
			ノートのインスタンス情報を左端に表示
			<template #caption>タイムライン上のインスタンス情報を左端に表示します。</template>
		</FormSwitch>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { defaultStore } from '@/store';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';

async function reloadAsk() {
	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

const tmsVerticalInstanceTicker = computed(defaultStore.makeGetterSetter('tmsVerticalInstanceTicker'));

watch([
	tmsVerticalInstanceTicker,
], async () => {
	await reloadAsk();
});
</script>
