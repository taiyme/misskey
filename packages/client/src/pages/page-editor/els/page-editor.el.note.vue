<template>
<!-- eslint-disable vue/no-mutating-props -->
<XContainer :draggable="true" @remove="() => $emit('remove')">
	<template #header><i class="ti ti-note"></i> {{ i18n.ts._pages.blocks.note }}</template>

	<section style="padding: 0 16px 0 16px;">
		<MkInput v-model="id">
			<template #label>{{ i18n.ts._pages.blocks._note.id }}</template>
			<template #caption>{{ i18n.ts._pages.blocks._note.idDescription }}</template>
		</MkInput>
		<MkSwitch v-model="value.detailed"><span>{{ i18n.ts._pages.blocks._note.detailed }}</span></MkSwitch>

		<MkNote v-if="note && !value.detailed" :key="`${note.id}:normal`" v-model:note="note" style="margin-bottom: 16px;"/>
		<MkNoteDetailed v-if="note && value.detailed" :key="`${note.id}:detail`" v-model:note="note" style="margin-bottom: 16px;"/>
	</section>
</XContainer>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { watch } from 'vue';
import { Note } from 'misskey-js/built/entities';
import XContainer from '../page-editor.container.vue';
import MkInput from '@/components/form/input.vue';
import MkSwitch from '@/components/form/switch.vue';
import MkNote from '@/components/MkNote.vue';
import MkNoteDetailed from '@/components/MkNoteDetailed.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const props = withDefaults(defineProps<{
	value?: {
		note: string | null;
		detailed: boolean;
	};
}>(), {
	value: () => ({
		note: null,
		detailed: false,
	}),
});

let id = $ref<string>(props.value.note ?? '');
let note = $ref<Note | null>(null);

watch($$(id), async () => {
	if (id && (id.startsWith('http://') || id.startsWith('https://'))) {
		props.value.note = (id.endsWith('/') ? id.slice(0, -1) : id).split('/').pop() ?? null;
	} else {
		props.value.note = id;
	}

	note = props.value.note
		? await os.api('notes/show', { noteId: props.value.note })
		: null;
}, {
	immediate: true,
});
</script>
