<template>
<MkPagination ref="pagingComponent" :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
			<div>{{ i18n.ts.noUsers }}</div>
		</div>
	</template>

	<template #default="{ items, users }">
		<div class="mk-user-card-mini-list" :class="{ links: props.useUserPage }">
			<template v-for="user in users" :key="user.id">
				<MkA v-if="props.useUserPage" :to="userPage(user)">
					<MkUserCardMini class="user" :user="user" :with-chart="props.withChart"/>
				</MkA>
				<MkUserCardMini v-else class="user" :user="user" :with-chart="props.withChart"/>
			</template>
		</div>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import { userPage } from '@/filters/user';
import { i18n } from '@/i18n';

const props = withDefaults(defineProps<{
	pagination: Paging;
	withChart: boolean;
	useUserPage: boolean;
}>(), {
	withChart: true,
	useUserPage: false,
});

const pagingComponent = ref<InstanceType<typeof MkPagination>>();
</script>

<style lang="scss" scoped>
</style>
