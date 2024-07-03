<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XMenuItemSuspense :item="props.item">
	<template #resolved="{ resolvedItem }">
		<XMenuItemResolved :id="props.id" :resolvedItem="resolvedItem"/>
	</template>
	<template #pending>
		<XMenuItemPending :id="props.id"/>
	</template>
</XMenuItemSuspense>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { type TmsMenuItemProps } from '@/components/TmsMenuItem.impl.js';

const XMenuItemSuspense = defineAsyncComponent(() => import('@/components/TmsMenuItem.suspense.vue'));
const XMenuItemResolved = defineAsyncComponent(() => import('@/components/TmsMenuItem.resolved.vue'));
const XMenuItemPending = defineAsyncComponent(() => import('@/components/TmsMenuItem.pending.vue'));

const props = defineProps<TmsMenuItemProps>();
</script>
