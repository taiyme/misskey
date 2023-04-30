<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkSpacer :content-max="700">
	<MkPagination v-slot="{items}" :pagination="pagination">
		<div :class="$style.clips">
			<MkA v-for="item in items" :key="item.id" :to="`/clips/${item.id}`" :class="[$style.clip, '_panel']">
				<div :class="$style.clipName">{{ item.name }}</div>
				<div v-if="item.description" :class="$style.clipDescription">{{ item.description }}</div>
			</MkA>
		</div>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as misskey from 'misskey-js';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: misskey.entities.User;
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
	gap: var(--margin);
}

.clip {
	display: block;
	padding: 16px;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
}

.clipName {
	font-weight: bold;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.clipDescription {
	margin-top: 8px;
	padding-top: 8px;
	border-top: solid 0.5px var(--divider);
}
</style>
