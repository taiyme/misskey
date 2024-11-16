<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<div style="container-type: inline-size;">
		<RouterView/>
	</div>

	<XCommon/>
</div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { instanceName } from '@@/js/config.js';
import XCommon from './_common_/common.vue';
import { useRoutingPageMetadata } from '@/scripts/page-metadata.js';
import { mainRouter } from '@/router/main.js';

const { routingPageMetadataRef } = useRoutingPageMetadata();
watch(routingPageMetadataRef, (pageMetadata) => {
	if (pageMetadata == null) return;
	if (isRoot.value && pageMetadata.title === instanceName) {
		document.title = pageMetadata.title;
	} else {
		document.title = `${pageMetadata.title} | ${instanceName}`;
	}
});

const isRoot = computed(() => mainRouter.currentRoute.value.name === 'index');

document.documentElement.style.overflowY = 'scroll';
</script>

<style lang="scss" module>
.root {
	min-height: 100dvh;
	box-sizing: border-box;
}
</style>
