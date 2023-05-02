<template>
<a ref="rootEl" :class="$style.root" class="_link" :href="url" target="_blank" rel="nofollow noopener" :title="url">
	<span :class="$style.inner" class="_monospace">
		<span :class="$style.codeType">{{ value.slice(0, 2) }}</span>
		<span :class="$style.codeNumber">{{ value.slice(2) }}</span>
	</span>
</a>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { useTooltip } from '@/scripts/use-tooltip';
import * as os from '@/os';

const props = defineProps<{
	value: string;
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

.inner {
	padding: 0.2em 0.4em;
	margin: 0;
	font-size: 0.85em;
	white-space: break-spaces;
	background-color: var(--buttonBg);
	border-radius: 6px;
}
</style>
