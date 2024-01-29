<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<template v-if="show"><slot></slot></template>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, ref } from 'vue';

const show = ref(true);

onActivated(() => {
	show.value = true;
});

onDeactivated(() => {
	show.value = false;
});
</script>
