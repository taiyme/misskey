<template>
<div :class="[$style.root, { [$style.active]: props.active }]" @click="draftMenu">
	<div :class="[$style.text, { [$style.textEmpty]: !text }]">{{ text || 'Empty' }}</div>
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
	<div v-if="labels.length !== 0" :class="$style.labels">
		<span v-for="label in labels" :key="label" :class="$style.label">{{ label }}</span>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os';
import { DraftWithId } from '@/scripts/tms/drafts';
import { i18n } from '@/i18n';
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';

const props = defineProps<{
	draft: DraftWithId;
	active?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'chosen', draftId: DraftWithId['id']): void;
	(ev: 'deleted', draftId: DraftWithId['id']): void;
	(ev: 'closed'): void;
}>();

const text = $ref(`${props.draft.data.cw || ''}\n${props.draft.data.text || ''}`.trim());
const files = $ref<Misskey.entities.DriveFile[]>(props.draft.data.files);

const labels = $ref<string[]>([]);
if (props.draft.data.renoteId) labels.push(i18n.ts.quote);
if (props.draft.data.poll) labels.push(i18n.ts.poll);

const draftMenu = (ev: MouseEvent): void => {
	if (props.active) return;

	const el = ev.currentTarget ?? ev.target;
	if (!(el instanceof HTMLElement)) return;

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
	display: grid;
	grid-auto-flow: row;
	gap: 6px;
	padding: 16px;
	background: var(--panel);
	color: var(--fg);
	border: solid 1px var(--divider);
	border-radius: 8px;
	user-select: none;

	&.active {
		border-style: dashed;

		> .text {
			opacity: 0.5;
		}

		> .files {
			display: none;
		}

		> .labels {
			display: none;
		}
	}
}

.text {
	overflow: hidden;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
}

.textEmpty {
	opacity: 0.5;
}

.files {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
	gap: 4px;
}

.file {
	aspect-ratio: 1 / 1;
}

.labels {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	font-size: 0.9em;
}

.label {
	border: solid 1px var(--divider);
	border-radius: 999px;
	padding: 3px 8px;
}
</style>
