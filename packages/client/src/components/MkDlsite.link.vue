<template>
<a ref="rootEl" :class="$style.root" class="_link" :href="url" target="_blank" rel="nofollow noopener" :title="url">
	<slot></slot>
	<i :class="$style.icon" class="ti ti-external-link"></i>
</a>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { useTooltip } from '@/scripts/use-tooltip';
import * as os from '@/os';

const props = defineProps<{
	url: string;
}>();

const rootEl = $ref<HTMLAnchorElement>();

useTooltip($$(rootEl), (showing) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
		showing,
		url: props.url,
		source: rootEl,
	}, {}, 'closed');
});
</script>

<style lang="scss" module>
.root {
	word-break: break-all;
}

.icon {
	padding-left: 2px;
	font-size: .9em;
}
</style>
