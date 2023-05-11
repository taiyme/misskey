<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkSpacer :content-max="700">
	<MkPagination v-slot="{items}" :pagination="pagination">
		<div :class="$style.pages">
			<MkPagePreview v-for="page in items" :key="page.id" :page="(page as any /* 定義されていないため */)"/>
		</div>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkPagePreview from '@/components/MkPagePreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: Misskey.entities.User;
}>();

const pagination = {
	endpoint: 'users/pages' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" module>
.pages {
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: 100%;
	gap: var(--margin);
}
</style>
