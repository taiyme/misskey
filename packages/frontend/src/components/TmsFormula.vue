<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XFormula :formula="props.formula" :block="props.block"/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

const props = defineProps<{
	formula: string;
	block: boolean;
}>();

const XFormula = defineAsyncComponent(() => import('@/components/TmsFormula.core.vue'));
</script>
