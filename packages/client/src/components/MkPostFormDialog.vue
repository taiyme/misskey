<template>
<MkModal ref="modal" :prefer-type="'dialog'" @click="modal?.close()" @closed="onModalClosed()">
	<MkPostForm :key="reloadCount" style="margin: 0 auto auto auto;" v-bind="{...props, reopen, draft}" autofocus freeze-after-posted @posted="onPosted" @cancel="modal?.close()" @esc="modal?.close()"/>
</MkModal>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'misskey-js';
import MkModal from '@/components/MkModal.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import { DraftWithId } from '@/scripts/tms/drafts';

const props = defineProps<{
	reply?: misskey.entities.Note;
	renote?: misskey.entities.Note;
	channel?: misskey.entities.Channel; // TODO
	mention?: misskey.entities.User;
	specified?: misskey.entities.User;
	initialText?: string;
	initialVisibility?: 'public' | 'home' | 'followers' | 'specified';
	initialFiles?: misskey.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: misskey.entities.User[];
	initialNote?: misskey.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

let reloadCount = $ref(0);
let draft = $ref<DraftWithId>();

const modal = $shallowRef<InstanceType<typeof MkModal>>();

const onPosted = (): void => {
	modal?.close({
		useSendAnimation: true,
	});
};

const onModalClosed = (): void => {
	emit('closed');
};

const reopen = (_draft: DraftWithId): void => {
	draft = _draft;
	reloadCount++;
};
</script>
