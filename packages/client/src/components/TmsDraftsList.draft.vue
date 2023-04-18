<template>
<div :class="[$style.root, { [$style.active]: props.active }]" @click="draftMenu">
	<div :class="$style.inner">
		<div :class="$style.text">
			<span v-if="hasReply" :class="$style.replyMark"><i class="ti ti-arrow-back-up"></i></span>
			<span v-if="text">{{ text }}</span>
			<span v-else :class="$style.textEmpty">Empty</span>
			<span v-if="hasRenote" :class="$style.quoteMark">RN:</span>
		</div>
		<div v-if="files.length !== 0" :class="$style.files">
			<ImgWithBlurhash
				v-for="{ id: fileId, url: src, blurhash: hash, comment, name } in files"
				:key="fileId"
				:src="src"
				:hash="hash"
				:alt="comment || name"
				:title="comment || name"
				:class="$style.file"
			/>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { Draft } from '@/scripts/tms/drafts';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';

const props = defineProps<{
	draft: Draft;
	active?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'chosen', draftId: Draft['id']): void;
	(ev: 'deleted', draftId: Draft['id']): void;
	(ev: 'closed'): void;
}>();

const text = $ref(`${props.draft.data.cw || ''}\n${props.draft.data.text || ''}${props.draft.data.poll ? ` (${i18n.ts.poll})` : ''}`.trim());
const files = $ref<Misskey.entities.DriveFile[]>(props.draft.data.files);

const hasReply = $ref(!!props.draft.data.replyId);
const hasRenote = $ref(!!props.draft.data.renoteId || !!props.draft.data.quoteId);

const draftMenu = (ev: MouseEvent): void => {
	if (props.active) return;

	const el = getHtmlElementFromEvent(ev);
	if (!el) return;

	const menu = [
		{
			text: i18n.ts._tms.loadDraft,
			icon: 'ti ti-check',
			action: () => emit('chosen', props.draft.id),
		},
		{
			text: i18n.ts.delete,
			icon: 'ti ti-trash',
			action: () => emit('deleted', props.draft.id),
			danger: true,
		},
	];

	os.popupMenu(menu, el);
};
</script>

<style lang="scss" module>
.root {
	padding: 16px;
	background: var(--panel);
	color: var(--fg);
	border: solid 1px var(--divider);
	border-radius: 8px;
	user-select: none;

	.inner {
		display: grid;
		grid-auto-flow: row;
		gap: 6px;
	}

	&.active {
		border-style: dashed;

		> .inner {
			opacity: 0.5;
		}
	}
}

.text {
	overflow: hidden;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	// display: -webkit-box;
	// -webkit-box-orient: vertical;
	// -webkit-line-clamp: 3;
}

.textEmpty {
	opacity: 0.5;
}

.replyMark {
	margin-right: 0.5em;
	color: var(--accent);
}

.quoteMark {
	margin-left: 0.5em;
	font-style: oblique;
	color: var(--accent);
}

.files {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
	gap: 4px;
}

.file {
	aspect-ratio: 1 / 1;
}
</style>
