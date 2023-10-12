<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSpacer :contentMax="700">
	<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
		<MkFlashPreview v-for="flash in items" :key="flash.id" :flash="flash" class="_margin"/>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type * as Misskey from 'misskey-js';
import MkFlashPreview from '@/components/MkFlashPreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: Misskey.entities.User;
}>();

const pagination = {
	endpoint: 'users/flashs' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>
