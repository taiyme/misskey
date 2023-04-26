<template>
<MkModal ref="modal" v-slot="{ type, maxHeight }" :z-priority="'high'" :src="src" :transparent-bg="true" @click="done(null)" @closed="emit('closed')">
	<MkMenu :items="items" :align="align" :width="width" :max-height="maxHeight" :as-drawer="type === 'drawer'" class="sfhdhdhq" :class="{ drawer: type === 'drawer' }" @close="done"/>
</MkModal>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkModal from './MkModal.vue';
import MkMenu from './MkMenu.vue';
import { MenuItem } from '@/types/menu';

defineProps<{
	items: MenuItem[];
	align?: 'center' | string;
	width?: number;
	viaKeyboard?: boolean;
	src?: HTMLElement;
}>();

const emit = defineEmits<{
	(ev: 'done', result: unknown): void;
	(ev: 'closed'): void;
}>();

const modal = $ref<InstanceType<typeof MkModal>>();

const done = (result: unknown): void => {
	modal?.close();
	emit('done', result);
};
</script>

<style lang="scss" scoped>
.sfhdhdhq {
	&.drawer {
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
}
</style>
