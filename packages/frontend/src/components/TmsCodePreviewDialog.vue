<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow ref="modal" :height="height" :width="width" @close="close()" @closed="emit('closed')">
	<!-- eslint-disable-next-line vue/no-v-html -->
	<div :class="[$style.centerPage, 'codeBlock']" v-html="html">
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import MkModalWindow from './MkModalWindow.vue';

const modal = shallowRef<InstanceType<typeof MkModalWindow>>();
const height = ref(window.innerHeight);
const width = ref(window.innerWidth);

const emit = defineEmits<{
		(event: 'closed'): void;
	}>();

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

defineProps<{
	html: string;
}>();
</script>

<style lang="scss" module>
.centerPage {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100cqh;
	box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.codeBlock :deep(.shiki) {
	margin: 0;
	padding-left: 1em;
	padding-right: 1em;
	height: 100%;
	width: 100%;
	display: inline-block;
	line-height: 1.5em;
	font-size: 1em;
	white-space: pre;

	& pre,
	& code {
		font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
	}
}
</style>
