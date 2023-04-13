<template>
<div :class="$style.root" @click="draftMenu">
	<div :class="[$style.text, { [$style.textEmpty]: !text }]">{{ text || 'Empty' }}</div>
	<div :class="$style.files">
		<ImgWithBlurhash
			v-for="{ id: fileId, url: src, blurhash: hash, comment, name } in props.draft.data.files"
			:key="fileId"
			:src="src"
			:hash="hash"
			:alt="comment || name"
			:title="comment || name"
			:class="$style.file"
		/>
	</div>
	<div :class="$style.labels">
		<span v-if="props.draft.data.renoteId" :class="$style.label">{{ i18n.ts.quote }}</span>
		<span v-if="props.draft.data.poll" :class="$style.label">{{ i18n.ts.poll }}</span>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as os from '@/os';
import { DraftWithId } from '@/scripts/tms/drafts';
import { i18n } from '@/i18n';
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';

const props = defineProps<{
	draft: DraftWithId;
}>();

const emit = defineEmits<{
	(ev: 'chosen', draftId: DraftWithId['id']): void;
	(ev: 'deleted', draftId: DraftWithId['id']): void;
	(ev: 'closed'): void;
}>();

const text = $ref(`${props.draft.data.cw || ''}\n${props.draft.data.text || ''}`.trim());

const draftMenu = (ev: MouseEvent): void => {
	const el = ev.currentTarget ?? ev.target;
	if (!(el instanceof HTMLElement)) return;

	const menu = [
		{
			text: '選択',
			icon: 'ti ti-check',
			action: () => emit('chosen', props.draft.id),
		},
		{
			text: '削除',
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
	gap: 4px;
	padding: 16px;
	background: var(--panel);
	color: var(--fg);
	border: solid 1px var(--divider);
	border-radius: 8px;
	user-select: none;
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
