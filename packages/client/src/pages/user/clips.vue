<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkSpacer :content-max="700">
	<MkPagination v-slot="{items}" :pagination="pagination">
		<div :class="$style.clips">
			<TmsClipPreview v-for="clip in items" :key="clip.id" :clip="(clip as any /* 定義されていないため */)"/>
		</div>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import TmsClipPreview from '@/components/TmsClipPreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: Misskey.entities.User;
}>();

const pagination = {
	endpoint: 'users/clips' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" module>
.clips {
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: 100%;
	gap: var(--margin);
}
</style>
