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
			<div v-else :class="$style.draftsList">
				<TmsDraft
					v-for="draftItem in draftsList"
					:key="draftItem.id"
					:draft="draftItem"
					:active="draftItem.id === active"
					@chosen="chosen"
					@deleted="deleted"
				/>
			</div>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { i18n } from '@/i18n';
import { Draft, getAllDraft, deleteDraft } from '@/scripts/tms/drafts';
import MkModalWindow from '@/components/MkModalWindow.vue';
import TmsDraft from '@/components/TmsDraftsList.draft.vue';

const props = withDefaults(defineProps<{
	active?: string | null;
}>(), {
	active: null,
});

const emit = defineEmits<{
	(ev: 'chosen', draft: Draft): void;
	(ev: 'closed'): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

const draftsList = $ref<Draft[]>(
	getAllDraft()
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		.sort(({ id }) => id === props.active ? -1 : 1),
);

const chosen = (draftId: Draft['id']): void => {
	const draft = draftsList.find(d => d.id === draftId);
	if (draft) emit('chosen', draft);
	dialog?.close();
};

const deleted = (draftId: Draft['id']): void => {
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
