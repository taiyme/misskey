<template>
<div class="ipledcug">
	<TmsStatus type="notfound">{{ i18n.ts.notFoundDescription }}</TmsStatus>
</div>
</template>

<script lang="ts" setup>
import TmsStatus from '@/components/global/TmsStatus.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.notFound,
	icon: 'ti ti-alert-triangle',
});
</script>
