<template>
<!-- eslint-disable vue/no-mutating-props -->
<XContainer :draggable="true" @remove="() => emit('remove')">
	<template #header><i class="ti ti-bolt"></i> {{ i18n.ts._pages.blocks.textInput }}</template>

	<section style="padding: 0 16px 0 16px;">
		<MkInput v-model="value.name"><template #prefix><i class="ti ti-wand"></i></template><template #label>{{ i18n.ts._pages.blocks._textInput.name }}</template></MkInput>
		<MkInput v-model="value.text"><template #label>{{ i18n.ts._pages.blocks._textInput.text }}</template></MkInput>
		<MkInput v-model="value.default" type="text"><template #label>{{ i18n.ts._pages.blocks._textInput.default }}</template></MkInput>
	</section>
</XContainer>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { } from 'vue';
import XContainer from '../page-editor.container.vue';
import MkInput from '@/components/form/input.vue';
import { i18n } from '@/i18n';

withDefaults(defineProps<{
	value: any;
}>(), {
	value: {
		name: '',
	},
});

const emit = defineEmits<{
	(ev: 'remove'): void;
}>();
</script>
