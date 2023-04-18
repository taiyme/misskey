<template>
<XFormula :formula="formula" :block="block"/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

const XFormula = defineAsyncComponent(() => import('@/components/MkFormulaCore.vue'));

defineProps<{
	formula: string;
	block: boolean;
}>();
</script>
