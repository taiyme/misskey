<template>
<!-- eslint-disable vue/no-mutating-props -->
<XContainer :draggable="true" @remove="() => emit('remove')">
	<template #header><i class="ti ti-bolt"></i> {{ i18n.ts._pages.blocks.textareaInput }}</template>

	<section style="padding: 0 16px 16px 16px;">
		<MkInput v-model="value.name"><template #prefix><i class="ti ti-wand"></i></template><template #label>{{ i18n.ts._pages.blocks._textareaInput.name }}</template></MkInput>
		<MkInput v-model="value.text"><template #label>{{ i18n.ts._pages.blocks._textareaInput.text }}</template></MkInput>
		<MkTextarea v-model="value.default"><template #label>{{ i18n.ts._pages.blocks._textareaInput.default }}</template></MkTextarea>
	</section>
</XContainer>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { } from 'vue';
import XContainer from '../page-editor.container.vue';
import MkTextarea from '@/components/form/textarea.vue';
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
