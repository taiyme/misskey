<template>
<MkPagination ref="pagingComponent" :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
			<div>{{ i18n.ts.noUsers }}</div>
		</div>
	</template>

	<template #default="{ users }">
		<div :class="$style.cardList">
			<template v-for="user in users" :key="user.id">
				<MkA v-if="useUserPage" :to="userPage(user)">
					<MkUserCardMini :user="user" :with-chart="withChart"/>
				</MkA>
				<MkUserCardMini v-else :user="user" :with-chart="withChart"/>
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

withDefaults(defineProps<{
	pagination: Paging;
	withChart: boolean;
	useUserPage: boolean;
}>(), {
	withChart: true,
	useUserPage: false,
});

const pagingComponent = ref<InstanceType<typeof MkPagination>>();
</script>

<style lang="scss" module>
.cardList {
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: 100%;
	gap: var(--margin);
}
</style>
