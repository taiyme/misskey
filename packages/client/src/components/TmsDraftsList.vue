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

const emit = defineEmits<{
	(ev: 'chosen', draft: DraftWithId): void;
	(ev: 'closed'): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

let draftsList: DraftWithId[] = $ref([]);

const init = (): void => {
	draftsList = getAllDraft();
};

init();

const chosen = (draftId: DraftWithId['id']): void => {
	const draft = draftsList.find(d => d.id === draftId);
	if (draft) emit('chosen', draft);
	dialog?.close();
};

const deleted = (draftId: DraftWithId['id']): void => {
	deleteDraft(draftId);
	init();
};
</script>

<style lang="scss" module>
.draftsList {
	display: grid;
	grid-auto-flow: row;
	gap: var(--margin);
}
</style>
