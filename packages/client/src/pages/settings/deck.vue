<template>
<div class="_formRoot">
	<FormSwitch v-model="navWindow">{{ i18n.ts.defaultNavigationBehaviour }}: {{ i18n.ts.openInWindow }}</FormSwitch>

	<FormSwitch v-model="alwaysShowMainColumn" class="_formBlock">{{ i18n.ts._deck.alwaysShowMainColumn }}</FormSwitch>

	<FormRadios v-model="columnAlign" class="_formBlock">
		<template #label>{{ i18n.ts._deck.columnAlign }}</template>
		<option value="left">{{ i18n.ts.left }}</option>
		<option value="center">{{ i18n.ts.center }}</option>
	</FormRadios>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormRadios from '@/components/form/radios.vue';
import { deckStore } from '@/ui/deck/deck-store';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const navWindow = computed(deckStore.makeGetterSetter('navWindow'));
const alwaysShowMainColumn = computed(deckStore.makeGetterSetter('alwaysShowMainColumn'));
const columnAlign = computed(deckStore.makeGetterSetter('columnAlign'));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.deck,
	icon: 'ti ti-columns',
});
</script>
