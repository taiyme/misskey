<template>
<MkModal ref="modal" :prefer-type="'dialog'" @click="onClick" @closed="onModalClosed()">
	<TmsRenoteForm ref="form" style="margin: 0 auto auto auto;" v-bind="props" @posted="onPosted" @cancel="modal?.close()" @esc="modal?.close()"/>
</MkModal>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'misskey-js';
import MkModal from '@/components/MkModal.vue';
import TmsRenoteForm from '@/components/TmsRenoteForm.vue';

const props = defineProps<{
	renote: Misskey.entities.Note;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const modal = $shallowRef<InstanceType<typeof MkModal>>();
const form = $shallowRef<InstanceType<typeof TmsRenoteForm>>();

const isFetching = (): boolean => !!form?.isFetching();

const onClick = (): void => {
	if (isFetching()) return;
	modal?.close();
};

const onPosted = (): void => {
	modal?.close({
		useSendAnimation: true,
	});
};

const onModalClosed = (): void => {
	emit('closed');
};
</script>
