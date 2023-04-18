<template>
<XColumn :column="column" :is-stacked="isStacked" @parent-focus="$event => emit('parent-focus', $event)">
	<template #header><i class="ti ti-star" style="margin-right: 8px;"></i>{{ column.name }}</template>

	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items }">
			<div :class="$style.notes">
				<XList v-slot="{ item }" :items="items" :direction="'down'" :no-gap="true" :ad="false">
					<MkNote :key="item.id" :note="item.note"/>
				</XList>
			</div>
		</template>
	</MkPagination>
</XColumn>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import XColumn from './column.vue';
import { Column } from './deck-store';
import MkPagination from '@/components/MkPagination.vue';
import MkNote from '@/components/MkNote.vue';
import XList from '@/components/MkDateSeparatedList.vue';
import { i18n } from '@/i18n';

defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const emit = defineEmits<{
	(ev: 'parent-focus', direction: 'up' | 'down' | 'left' | 'right'): void;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

const pagination = {
	endpoint: 'i/favorites' as const,
	limit: 10,
};
</script>

<style lang="scss" module>
.notes {
	background: var(--panel);
}
</style>
