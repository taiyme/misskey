<template>
<!-- eslint-disable vue/no-mutating-props -->
<XContainer :draggable="true" @remove="() => $emit('remove')">
	<template #header><i class="ti ti-question-mark"></i> {{ i18n.ts._pages.blocks.if }}</template>
	<template #func>
		<button class="_button" @click="add()">
			<i class="ti ti-plus"></i>
		</button>
	</template>

	<section class="romcojzs">
		<MkSelect v-model="value.var">
			<template #label>{{ i18n.ts._pages.blocks._if.variable }}</template>
			<option v-for="(v, i) in hpml.getVarsByType('boolean')" :key="i" :value="v.name">{{ v.name }}</option>
			<optgroup :label="i18n.ts._pages.script.pageVariables">
				<option v-for="(v, i) in hpml.getPageVarsByType('boolean')" :key="i" :value="v">{{ v }}</option>
			</optgroup>
			<optgroup :label="i18n.ts._pages.script.enviromentVariables">
				<option v-for="(v, i) in hpml.getEnvVarsByType('boolean')" :key="i" :value="v">{{ v }}</option>
			</optgroup>
		</MkSelect>

		<XBlocks v-model="value.children" class="children" :hpml="hpml"/>
	</section>
</XContainer>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { defineAsyncComponent, inject } from 'vue';
import { v4 as uuid } from 'uuid';
import XContainer from '../page-editor.container.vue';
import MkSelect from '@/components/form/select.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const XBlocks = defineAsyncComponent(() => import('../page-editor.blocks.vue'));

const props = withDefaults(defineProps<{
	value: any;
	hpml: any;
}>(), {
	value: {
		children: [],
		var: null,
	},
});

const getPageBlockList = inject<(any) => any>('getPageBlockList');

async function add() {
	const { canceled, result: type } = await os.select({
		title: i18n.ts._pages.chooseBlock,
		groupedItems: getPageBlockList()
	});
	if (canceled) return;

	const id = uuid();
	props.value.children.push({ id, type });
}
</script>

<style lang="scss" scoped>
.romcojzs {
	padding: 0 16px 16px 16px;
}
</style>
