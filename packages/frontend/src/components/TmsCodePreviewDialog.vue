<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="modal"
	:height="height"
	:width="width"
	@close="close()"
	@closed="emit('closed')"
>
	<template #header><i class="ti ti-file-text"></i> {{ name }}</template>
	<MkCode :lang="lang" :code="code" :class="[$style.codeBlock, 'codeBlock']"/>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkCode from '@/components/MkCode.vue';

defineProps<{
	name: string;
	lang?: string;
	code: string;
}>();

const emit = defineEmits<{
	closed: [];
}>();

const modal = shallowRef<InstanceType<typeof MkModalWindow>>();
const height = ref(window.innerHeight);
const width = ref(window.innerWidth);

const close = () => {
	modal.value?.close();
};

const resizeModal = () => {
	const h = window.innerHeight;
	const w = window.innerWidth;

	if (w < 600) {
		height.value = h;
		width.value = w;
	} else {
		height.value = h * 0.8;
		width.value = w * 0.8;
	}
};

onMounted(() => {
	resizeModal();
	window.addEventListener('resize', resizeModal);
});

onUnmounted(() => {
	window.removeEventListener('resize', resizeModal);
});
</script>

<style lang="scss" module>
.codeBlock {
	height: 100%;

	> div {
		height: 100%;
	}
}
</style>

<style lang="scss" scoped>
.codeBlock :deep(pre.shiki) {
	margin: 0;
	height: 100%;
	border-radius: 0;
}
</style>
