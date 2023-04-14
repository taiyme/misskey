<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	@click="dialog?.close()"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts._tms.drafts }}</template>

	<MkSpacer :margin-min="20" :margin-max="28">
		<div class="tms-drafts-list _gaps">
			<div v-if="draftsList.length === 0" class="_fullinfo">
				<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
				<div>{{ i18n.ts.nothing }}</div>
			</div>
			<div v-else :class="$style.drastsList">
				<TmsDraft v-for="draftItem in draftsList" :key="draftItem.id" :draft="draftItem" @chosen="chosen" @deleted="deleted"/>
			</div>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { i18n } from '@/i18n';
import MkModalWindow from '@/components/MkModalWindow.vue';
import TmsDraft from '@/components/TmsDraftsList.draft.vue';
import { DraftWithId, getAllDraft, deleteDraft } from '@/scripts/tms/drafts';

const props = withDefaults(defineProps<{
	ignoreDraftIds?: string[];
}>(), {
	ignoreDraftIds: (): string[] => [],
});

const emit = defineEmits<{
	(ev: 'chosen', draft: DraftWithId): void;
	(ev: 'closed'): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

const draftsList = $ref<DraftWithId[]>(getAllDraft().filter(({ id }) => !props.ignoreDraftIds.includes(id)));

const chosen = (draftId: DraftWithId['id']): void => {
	const draft = draftsList.find(d => d.id === draftId);
	if (draft) emit('chosen', draft);
	dialog?.close();
};

const deleted = (draftId: DraftWithId['id']): void => {
	deleteDraft(draftId);
	const index = draftsList.findIndex(({ id }) => draftId === id);
	if (index !== -1) draftsList.splice(index, 1);
};
</script>

<style lang="scss" module>
.draftsList {
	display: grid;
	grid-auto-flow: row;
	gap: var(--margin);
}
</style>
