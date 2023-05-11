<template>
<MkModal ref="modal" :prefer-type="'dialog'" @click="onClick" @closed="onModalClosed()">
	<TmsPostForm ref="form" style="margin: 0 auto auto auto;" v-bind="props" autofocus freeze-after-posted @posted="onPosted" @cancel="modal?.close()" @esc="modal?.close()"/>
</MkModal>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'misskey-js';
import MkModal from '@/components/MkModal.vue';
import TmsPostForm from '@/components/TmsPostForm.vue';

const props = defineProps<{
	reply?: Misskey.entities.Note;
	renote?: Misskey.entities.Note;
	channel?: Misskey.entities.Channel; // TODO
	mention?: Misskey.entities.User;
	specified?: Misskey.entities.User;
	initialText?: string;
	initialVisibility?: 'public' | 'home' | 'followers' | 'specified';
	initialFiles?: Misskey.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: Misskey.entities.User[];
	initialNote?: Misskey.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const modal = $shallowRef<InstanceType<typeof MkModal>>();
const form = $shallowRef<InstanceType<typeof TmsPostForm>>();

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
