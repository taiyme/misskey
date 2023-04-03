<template>
<MkA v-if="props.url.startsWith(local)" ref="selfEl" :class="$style.root" class="xlcxczvw _link" :to="props.url.substring(local.length)" :rel="rel" :title="props.url">
	<slot></slot>
</MkA>
<a v-else ref="linkEl" :class="$style.root" class="xlcxczvw _link" :href="props.url" :rel="rel ?? undefined" :title="props.url" target="_blank">
	<slot></slot>
	<i :class="$style.icon" class="ti ti-external-link icon"></i>
</a>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { url as local } from '@/config';
import { useTooltip } from '@/scripts/use-tooltip';
import * as os from '@/os';
import MkA from '@/components/global/MkA.vue';

const props = withDefaults(defineProps<{
	url: string;
	rel?: null | string;
}>(), {
	rel: null,
});

const selfEl = $ref<InstanceType<typeof MkA>>();
const linkEl = $ref<HTMLAnchorElement>();

const el = selfEl?.el ?? linkEl ?? null;

const url = new URL(props.url);
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid url');

useTooltip($$(el), (showing) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
		showing,
		url: props.url,
		source: el,
	}, {}, 'closed');
});
</script>

<style lang="scss" module>
.root {
	word-break: break-all;
}

.icon {
	padding-left: 2px;
	font-size: 0.9em;
}
</style>
