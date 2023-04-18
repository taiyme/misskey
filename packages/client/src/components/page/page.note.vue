<template>
<div class="voxdxuby">
	<MkNote v-if="note && !block.detailed" :key="`${note.id}:normal`" v-model:note="note"/>
	<MkNoteDetailed v-if="note && block.detailed" :key="`${note.id}:detail`" v-model:note="note"/>
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Note } from 'misskey-js/built/entities';
import MkNote from '@/components/MkNote.vue';
import MkNoteDetailed from '@/components/MkNoteDetailed.vue';
import * as os from '@/os';
import { NoteBlock } from '@/scripts/hpml/block';

const props = defineProps<{
	block: NoteBlock;
}>();

const note = ref<Note | null>(null);

onMounted(() => {
	if (!props.block.note) return;

	os.api('notes/show', { noteId: props.block.note })
		.then(result => {
			note.value = result;
		});
});
</script>

<style lang="scss" scoped>
.voxdxuby {
	margin: 1em 0;
}
</style>
