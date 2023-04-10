<template>
<div :class="$style.root" @click="draftMenu">
	<div :class="$style.text">{{ props.draft.data.text }}</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as os from '@/os';
import { DraftWithId } from '@/scripts/tms/drafts';

const props = defineProps<{
	draft: DraftWithId;
}>();

const emit = defineEmits<{
	(ev: 'chosen', draftId: DraftWithId['id']): void;
	(ev: 'deleted', draftId: DraftWithId['id']): void;
	(ev: 'closed'): void;
}>();

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
	user-select: none;
}
</style>
