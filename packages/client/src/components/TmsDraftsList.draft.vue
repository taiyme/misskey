<template>
<div :class="$style.root" @click="draftMenu">
	<div :class="$style.labels">
		<span v-if="props.draft.data.visibility !== 'public'" :class="$style.label">{{ i18n.ts._visibility[props.draft.data.visibility] }}</span>
		<span v-if="props.draft.data.localOnly" :class="$style.label">{{ i18n.ts._visibility.disableFederation }}</span>
		<span v-if="props.draft.data.replyId" :class="$style.label">{{ i18n.ts.reply }}</span>
		<span v-if="props.draft.data.renoteId" :class="$style.label">{{ i18n.ts.quote }}</span>
	</div>
	<div :class="[$style.text, { [$style.textEmpty]: !text }]">{{ text || 'Empty' }}</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as os from '@/os';
import { DraftWithId } from '@/scripts/tms/drafts';
import { i18n } from '@/i18n';

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
	padding: 16px;
	background: var(--panel);
	color: var(--fg);
	border: solid 1px var(--divider);
	border-radius: 8px;
	user-select: none;
	margin-bottom: var(--margin);
}

.labels {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	font-size: 0.9em;
	margin-bottom: 4px;
}

.label {
	border: solid 1px var(--divider);
	border-radius: 999px;
	margin-right: 4px;
	padding: 3px 8px;
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
</style>
