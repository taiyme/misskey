<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XMenuCore/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { type TmsMenuProps, provideMenuDefinition } from '@/components/TmsMenu.impl.js';

const XMenuCore = defineAsyncComponent(() => import('@/components/TmsMenu.core.vue'));

const props = defineProps<TmsMenuProps>();

provideMenuDefinition(() => props);
</script>
