<template>
<TmsPostFormCore
	v-if="showPostForm"
	ref="form"
	v-bind="bindProps"
	:instant="props.instant"
	:fixed="props.fixed"
	:autofocus="props.autofocus"
	:freeze-after-posted="props.freezeAfterPosted"
	@posted="posted"
	@cancel="cancel"
	@esc="esc"
	@reopen="reopen"
/>
</template>

<script lang="ts" setup>
import { ref, shallowRef, nextTick, onMounted } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import * as Draft from '@/scripts/tms/drafts';
import MkWaitingDialog from '@/components/MkWaitingDialog.vue';
import TmsPostFormCore from '@/components/TmsPostForm.core.vue';

const props = withDefaults(defineProps<{
	reply?: Misskey.entities.Note | null;
	renote?: Misskey.entities.Note | null;
	channel?: Misskey.entities.Channel | null;
	mention?: Misskey.entities.User | null;
	specified?: Misskey.entities.User | null;
	initialText?: string | null;
	initialVisibility?: Misskey.entities.Note['visibility'] | null;
	initialFiles?: Misskey.entities.DriveFile[] | null;
	initialLocalOnly?: boolean | null;
	initialVisibleUsers?: Misskey.entities.User[] | null;
	initialNote?: Misskey.entities.Note | null;
	instant?: boolean | null;
	fixed?: boolean | null;
	autofocus?: boolean | null;
	freezeAfterPosted?: boolean | null;
}>(), {
	reply: null,
	renote: null,
	channel: null,
	mention: null,
	specified: null,
	initialText: null,
	initialVisibility: null,
	initialFiles: null,
	initialLocalOnly: null,
	initialVisibleUsers: null,
	initialNote: null,
	instant: null,
	fixed: null,
	autofocus: true,
	freezeAfterPosted: null,
});

const emit = defineEmits<{
	(ev: 'posted'): void;
	(ev: 'cancel'): void;
	(ev: 'esc'): void;
	(ev: 'reopen', draft?: Draft.Draft | null): void;
}>();

let bindProps = $ref<{
	draft?: Draft.Draft | null;
	reply?: Misskey.entities.Note | null;
	renote?: Misskey.entities.Note | null;
	channel?: Misskey.entities.Channel | null;
	mention?: Misskey.entities.User | null;
	specified?: Misskey.entities.User | null;
	initialText?: string | null;
	initialVisibility?: Misskey.entities.Note['visibility'] | null;
	initialFiles?: Misskey.entities.DriveFile[] | null;
	initialLocalOnly?: boolean | null;
	initialVisibleUsers?: Misskey.entities.User[] | null;
}>({
	draft: null,
	reply: props.reply,
	renote: props.renote,
	channel: props.channel,
	mention: props.mention,
	specified: props.specified,
	initialText: props.initialText,
	initialVisibility: props.initialVisibility,
	initialFiles: props.initialFiles,
	initialLocalOnly: props.initialLocalOnly,
	initialVisibleUsers: props.initialVisibleUsers,
});

const form = shallowRef<InstanceType<typeof TmsPostFormCore> | null>(null);

const isFetching = (): boolean => !!form.value?.isFetching();

defineExpose({
	isFetching,
});

const showPostForm = ref(false);

const shown = (): void => {
	showPostForm.value = true;
};

const hidden = (): void => {
	showPostForm.value = false;
};

onMounted(() => {
	hidden();

	if (props.initialNote) {
		const init = props.initialNote as Misskey.entities.Note & {
			channel?: Misskey.entities.Channel;
		};

		const draftId = Draft.genDraftId({
			user: $i,
			isEdit: true,
		});

		bindProps.draft = Draft.setDraft(draftId, {
			text: init.text ?? '',
			useCw: init.cw != null,
			cw: init.cw ?? '',
			visibility: init.visibility,
			localOnly: !!init.localOnly,
			files: init.files,
			poll: init.poll ? {
				choices: init.poll.choices.map(x => x.text),
				multiple: init.poll.multiple,
				expiresAt: init.poll.expiresAt ? new Date(init.poll.expiresAt).getTime() : null,
				expiredAfter: null,
			} : null,
			replyId: init.reply?.id ?? null,
			renoteId: init.renote?.id ?? null,
			channelId: init.channel?.id ?? null,
			quoteId: null,
		}, true);
	}

	nextTick(shown);
});

const posted = (): void => {
	emit('posted');
};

const cancel = (): void => {
	if (isFetching()) return;
	emit('cancel');
};

const esc = (): void => {
	if (isFetching()) return;
	emit('esc');
};

const reopen = async (draft?: Draft.Draft | null): Promise<void> => {
	if (isFetching()) return;

	hidden();

	bindProps = {};

	if (!draft) {
		nextTick(shown);
		return;
	}

	const { replyId, renoteId, channelId, isEdit } = Draft.parseDraftId(draft.id);

	const reply = replyId ? os.api('notes/show', { noteId: replyId }).catch(() => null) : null;
	const renote = renoteId ? os.api('notes/show', { noteId: renoteId }).catch(() => null) : null;
	const channel = channelId ? (os.api('channels/show', { channelId: channelId }) as Promise<Misskey.entities.Channel>).catch(() => null) : null;

	const showing = ref(true);
	Promise.allSettled([reply, renote, channel]).then(() => {
		showing.value = false;
	});

	os.popup(MkWaitingDialog, {
		success: false,
		showing,
		text: i18n.ts.processing,
	}, {}, 'closed');

	bindProps.reply = await reply;
	bindProps.renote = await renote;
	bindProps.channel = await channel;

	bindProps.draft = Draft.setDraft(draft.id, {
		...draft.data,
		replyId: bindProps.reply?.id ?? null,
		renoteId: bindProps.renote?.id ?? null,
		channelId: bindProps.channel?.id ?? null,
	}, isEdit);

	nextTick(shown);
};
</script>
