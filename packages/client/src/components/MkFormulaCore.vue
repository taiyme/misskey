<template>
<!-- eslint-disable-next-line vue/no-v-html -->
<div v-if="block" v-html="compiledFormula"></div>
<!-- eslint-disable-next-line vue/no-v-html -->
<span v-else v-html="compiledFormula"></span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import katex from 'katex';

const props = defineProps<{
	formula: string;
	block: boolean;
}>();

const compiledFormula = computed(() => {
	return katex.renderToString(props.formula, {
		throwOnError: false,
	});
});
</script>

<style>
@import "../../node_modules/katex/dist/katex.min.css";
</style>
