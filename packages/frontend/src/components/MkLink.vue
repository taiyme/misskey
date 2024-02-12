<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component
	:is="self ? 'MkA' : 'a'"
	ref="rootEl"
	style="word-break: break-all;"
	class="_link"
	:[attr]="self ? url.substring(local.length) : url"
	:rel="rel ?? 'nofollow noopener'"
	:target="target"
	:title="url"
>
	<slot></slot>
	<i v-if="target === '_blank'" class="ti ti-external-link" :class="$style.icon"></i>
</component>
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
});

const self = props.url.startsWith(local);
const attr = self ? 'to' : 'href';
const target = self ? null : '_blank';

const rootEl = shallowRef<HTMLAnchorElement | InstanceType<typeof MkA> | null>(null);
const anchorElement = computed(() => {
	if (rootEl.value == null) return null;
	if (rootEl.value instanceof HTMLAnchorElement) return rootEl.value;
	return rootEl.value.getAnchorElement();
});

useTooltip(anchorElement, (showing) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
		showing,
		url: props.url,
		source: anchorElement.value,
	}, {}, 'closed');
});
</script>

<style lang="scss" module>
.icon {
	padding-left: 2px;
	font-size: .9em;
}
</style>
