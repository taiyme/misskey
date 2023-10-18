<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA v-if="props.url.startsWith(local)" ref="selfEl" :class="[$style.root, '_link']" :to="props.url.substring(local.length)" :rel="rel" :title="props.url">
	<slot></slot>
</MkA>
<a v-else ref="linkEl" :class="[$style.root, '_link']" :href="props.url" :rel="rel ?? undefined" :title="props.url" target="_blank">
	<slot></slot>
	<i :class="$style.icon" class="ti ti-external-link icon"></i>
</a>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, shallowRef } from 'vue';
import { url as local } from '@/config.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import * as os from '@/os.js';
import MkA from '@/components/global/MkA.vue';

const props = withDefaults(defineProps<{
	url: string;
	rel?: null | string;
}>(), {
	rel: null,
});

const selfEl = shallowRef<InstanceType<typeof MkA>>();
const linkEl = shallowRef<HTMLAnchorElement>();

const el = computed(() => selfEl.value?.getAnchorElement() ?? linkEl.value ?? null);

useTooltip(el, (showing) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
		showing,
		url: props.url,
		source: el.value,
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
