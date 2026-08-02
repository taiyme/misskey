<!--
SPDX-FileCopyrightText: Copyright (c) 2026 taiy, <https://taiy.me/>
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<a
	ref="rootEl"
	:class="[$style.root, '_link']"
	:href="url"
	target="_blank"
	rel="nofollow noopener"
	:title="rjNumber"
>
	<span :class="[$style.inner, '_monospace']">{{ rjNumber }}</span>
</a>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, useTemplateRef } from 'vue';
import { popup } from '@/os.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { isEnabledUrlPreview } from '@/utility/url-preview.js';

const props = defineProps<{
	rjNumber: string;
	url: string;
}>();

const rootEl = useTemplateRef('rootEl');

useTooltip(rootEl, (showing) => {
	if (isEnabledUrlPreview.value && rootEl.value != null) {
		const { dispose } = popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
			showing,
			url: props.url,
			anchorElement: rootEl.value,
		}, {
			closed: () => dispose(),
		});
	}
});
</script>

<style lang="scss" module>
.root {
	word-break: break-all;
}

.inner {
	padding: 0.2em 0.4em;
	font-size: 0.85em;
	white-space: break-spaces;
	background-color: var(--MI_THEME-buttonBg);
	border-radius: 6px;
}
</style>
