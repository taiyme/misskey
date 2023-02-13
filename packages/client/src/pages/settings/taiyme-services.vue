<template>
<div class="_formRoot">
	<MkKeyValue class="_formBlock" :copy="version">
		<template #key>{{ i18n.ts.version }}</template>
		<template #value>{{ version }}</template>
	</MkKeyValue>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { definePageMetadata } from '@/scripts/page-metadata';

definePageMetadata({
	title: 'taiyme-services',
	icon: 'ti ti-help',
});
</script>
