<template>
<XModalWindow
	ref="dialog"
	:width="800"
	:height="500"
	:with-ok-button="true"
	:ok-button-disabled="(type === 'file') && (selected.length === 0)"
	@click="cancel()"
	@close="cancel()"
	@ok="ok()"
	@closed="emit('closed')"
>
	<template #header>
		{{ multiple ? ((type === 'file') ? i18n.ts.selectFiles : i18n.ts.selectFolders) : ((type === 'file') ? i18n.ts.selectFile : i18n.ts.selectFolder) }}
		<span v-if="selected.length > 0" style="margin-left: 8px; opacity: 0.5;">({{ number(selected.length) }})</span>
	</template>
	<XDrive :multiple="multiple" :select="type" @change-selection="onChangeSelection" @selected="ok()"/>
</XModalWindow>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DriveFile } from 'misskey-js/built/entities';
import XDrive from '@/components/MkDrive.vue';
import XModalWindow from '@/components/MkModalWindow.vue';
import number from '@/filters/number';
import { i18n } from '@/i18n';

withDefaults(defineProps<{
	type?: 'file' | 'folder';
	multiple: boolean;
}>(), {
	type: 'file',
});

const emit = defineEmits<{
	(ev: 'done', r?: DriveFile[]): void;
	(ev: 'closed'): void;
}>();

const dialog = ref<InstanceType<typeof XModalWindow>>();

const selected = ref<DriveFile[]>([]);

const ok = (): void => {
	emit('done', selected.value);
	dialog.value?.close();
};

const cancel = (): void => {
	emit('done');
	dialog.value?.close();
};

const onChangeSelection = (files: DriveFile[]): void => {
	selected.value = files;
};
</script>
