<template>
<TmsPostFormCore
	v-if="showPostForm"
	v-bind="bindProps"
	:instant="props.instant"
	:fixed="props.fixed"
	:autofocus="props.autofocus"
	:freeze-after-posted="props.freezeAfterPosted"
	@posted="emit('posted')"
	@cancel="emit('cancel')"
	@esc="emit('esc')"
	@reopen="reopen"
/>
</template>

<script lang="ts" setup>
import { nextTick, onMounted } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import * as Draft from '@/scripts/tms/drafts';
import TmsPostFormCore from '@/components/TmsPostForm.core.vue';

let showPostForm = $ref(false);

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

onMounted(() => {
	if (props.initialNote) {
		const init = props.initialNote as Misskey.entities.Note & {
			channel?: Misskey.entities.Channel;
		};

		const draftId = Draft.genDraftId({
			user: $i,
			isEdit: true,
		});

		Draft.setDraft(draftId, {
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
		});

		bindProps.draft = Draft.getDraft(draftId);
	}

	nextTick(() => showPostForm = true);
});

const reopen = async (draft?: Draft.Draft | null): Promise<void> => {
	showPostForm = false;

	if (!draft) {
		bindProps = {};
		nextTick(() => showPostForm = true);
		return;
	}

	const { replyId, renoteId, channelId } = Draft.parseDraftId(draft.id);

	const reply = replyId ? os.api('notes/show', { noteId: replyId }).catch(() => null) : null;
	const renote = renoteId ? os.api('notes/show', { noteId: renoteId }).catch(() => null) : null;
	const channel = channelId ? os.api('channels/show', { channelId: channelId }).catch(() => null) : null;

	os.promiseDialog(Promise.allSettled([reply, renote, channel]), null, null, i18n.ts.processing);

	bindProps = {};

	bindProps.reply = await reply;
	bindProps.renote = await renote;
	bindProps.channel = (await channel) as Misskey.entities.Channel | null;

	Draft.setDraft(draft.id, {
		...draft.data,
		replyId: (await reply)?.id ?? null,
		renoteId: (await renote)?.id ?? null,
		channelId: (await channel)?.id ?? null,
	});

	bindProps.draft = Draft.getDraft(draft.id);

	nextTick(() => showPostForm = true);
};
</script>
