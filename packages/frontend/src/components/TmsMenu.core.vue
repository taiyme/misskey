<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="props == null"></div>
<div v-else role="menu" @focusin.passive.stop="() => {}">
	<div
		ref="itemsEl"
		v-hotkey="{}"
		tabindex="0"
		class="_popup _shadow"
		:class="{
			[$style.root]: true,
			[$style.asDrawer]: props.asDrawer,
		}"
		:style="{
			width: (props.width && !props.asDrawer) ? `${props.width}px` : '',
			maxHeight: props.maxHeight ? `${props.maxHeight}px` : '',
		}"
		@keydown.stop="() => {}"
		@contextmenu.self.prevent="() => {}"
	>
		<XMenuItem v-for="{ id, item } in props.items" :key="id" :id="id" :item="item"/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { injectMenuDefinition } from '@/components/TmsMenu.impl.js';

const XMenuItem = defineAsyncComponent(() => import('@/components/TmsMenuItem.vue'));

const props = injectMenuDefinition();
</script>

<style lang="scss" module>
.root {
	padding: 8px 0;
	box-sizing: border-box;
	max-width: 100vw;
	min-width: 200px;
	overflow: auto;
	overscroll-behavior: contain;

	&:focus-visible {
		outline: none;
	}

	&.asDrawer {
		padding: 12px 0 max(env(safe-area-inset-bottom, 0px), 12px) 0;
		width: 100%;
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
}
</style>
