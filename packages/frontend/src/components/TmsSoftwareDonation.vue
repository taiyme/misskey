<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<FormLink to="https://u.taiy.me/donate" external>
	<template #icon><i class="ti ti-pig-money"></i></template>
	<template #default>{{ i18n.tsx._tms.supportX({ name: i18n.ts._tms.taiy }) }}</template>
	<template #suffix>Donation</template>
</FormLink>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';
import FormLink from '@/components/form/link.vue';
</script>
