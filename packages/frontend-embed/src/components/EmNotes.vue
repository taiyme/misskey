<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<EmPagination ref="pagingComponent" :pagination="pagination" :disableAutoLoad="disableAutoLoad">
	<template #empty>
		<div class="_fullinfo">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.noNotes }}</div>
		</div>
	</template>

	<template #default="{ items: notes }">
		<div :class="$style.root">
			<EmNote v-for="note in notes" :key="note._featuredId_ || note._prId_ || note.id" :class="$style.note" :note="note"/>
		</div>
	</template>
</EmPagination>
</template>

<script lang="ts" setup>
import { computed, inject, useTemplateRef } from 'vue';
import { DEFAULT_INFO_IMAGE_URL } from '@@/js/const.js';
import EmNote from '@/components/EmNote.vue';
import EmPagination, { type Paging } from '@/components/EmPagination.vue';
import { i18n } from '@/i18n.js';
import { DI } from '@/di.js';

const serverMetadata = inject(DI.serverMetadata)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

const infoImageUrl = computed(() => serverMetadata.infoImageUrl ?? DEFAULT_INFO_IMAGE_URL);

withDefaults(defineProps<{
	pagination: Paging;
	noGap?: boolean;
	disableAutoLoad?: boolean;
	ad?: boolean;
}>(), {
	ad: true,
});

const pagingComponent = useTemplateRef('pagingComponent');

defineExpose({
	pagingComponent,
});
</script>

<style lang="scss" module>
.root {
	background: var(--MI_THEME-panel);
}

.note {
	border-bottom: 0.5px solid var(--MI_THEME-divider);
}
</style>
