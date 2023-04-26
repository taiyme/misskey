<template>
<div v-show="props.modelValue.length != 0" class="skeikyzd">
	<Sortable :model-value="props.modelValue" class="files" item-key="id" :animation="150" :delay="100" :delay-on-touch-only="true" @update:model-value="v => emit('update:modelValue', v)">
		<template #item="{element}">
			<div class="file" @click="showFileMenu(element, $event)" @contextmenu.prevent="showFileMenu(element, $event)">
				<MkDriveFileThumbnail :data-id="element.id" class="thumbnail" :file="element" fit="cover"/>
				<div v-if="element.isSensitive" class="sensitive">
					<i class="ti ti-alert-triangle icon"></i>
				</div>
			</div>
		</template>
	</Sortable>
	<div v-if="props.modelValue.length <= 16" class="remain">{{ 16 - props.modelValue.length }}/16</div>
	<div v-else class="remain over">{{ 16 - props.modelValue.length }}</div>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { DriveFile } from 'misskey-js/built/entities';
import MkDriveFileThumbnail from '@/components/MkDriveFileThumbnail.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const props = defineProps<{
	modelValue: DriveFile[];
	detachMediaFn?: (id: string) => void;
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', value: DriveFile[]): void;
	(ev: 'detach', id: string): void;
	(ev: 'changeSensitive', file: DriveFile, isSensitive: boolean): void;
	(ev: 'changeName', file: DriveFile, changedName: string): void;
}>();

let menuShowing = false;

const detachMedia = (id: string): void => {
	if (props.detachMediaFn) {
		props.detachMediaFn(id);
	} else {
		emit('detach', id);
	}
};

const toggleSensitive = (file: DriveFile): void => {
	os.api('drive/files/update', {
		fileId: file.id,
		isSensitive: !file.isSensitive,
	}).then(() => {
		emit('changeSensitive', file, !file.isSensitive);
	});
};

const rename = async (file: DriveFile): Promise<void> => {
	const { canceled, result: changedName } = await os.inputText({
		title: i18n.ts.enterFileName,
		default: file.name,
		allowEmpty: false,
	});
	if (canceled) return;
	os.api('drive/files/update', {
		fileId: file.id,
		name: changedName,
	}).then(() => {
		emit('changeName', file, changedName);
		file.name = changedName;
	});
};

const describe = async (file: DriveFile): Promise<void> => {
	os.popup(defineAsyncComponent(() => import('@/components/MkFileCaptionEditWindow.vue')), {
		default: file.comment !== null ? file.comment : '',
		file: file,
	}, {
		done: (caption: string) => {
			const comment = caption.length === 0 ? null : caption;
			os.api('drive/files/update', {
				fileId: file.id,
				comment,
			}).then(() => {
				file.comment = comment;
			});
		},
	}, 'closed');
};

const showFileMenu = (file: DriveFile, ev: MouseEvent): void => {
	if (menuShowing) return;
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	os.popupMenu([{
		text: i18n.ts.renameFile,
		icon: 'ti ti-forms',
		action: () => rename(file),
	}, {
		text: file.isSensitive ? i18n.ts.unmarkAsSensitive : i18n.ts.markAsSensitive,
		icon: file.isSensitive ? 'ti ti-eye-off' : 'ti ti-eye',
		action: () => toggleSensitive(file),
	}, {
		text: i18n.ts.describeFile,
		icon: 'ti ti-text-caption',
		action: () => describe(file),
	}, {
		text: i18n.ts.attachCancel,
		icon: 'ti ti-circle-x',
		action: () => detachMedia(file.id),
	}], el).then(() => menuShowing = false);
	menuShowing = true;
};
</script>

<style lang="scss" scoped>
.skeikyzd {
	padding: 8px 16px;
	position: relative;

	> .files {
		display: flex;
		flex-wrap: wrap;

		> .file {
			position: relative;
			width: 64px;
			height: 64px;
			margin-right: 4px;
			border-radius: 4px;
			overflow: hidden;
			cursor: move;

			&:hover > .remove {
				display: block;
			}

			> .thumbnail {
				width: 100%;
				height: 100%;
				z-index: 1;
				color: var(--fg);
			}

			> .sensitive {
				display: flex;
				position: absolute;
				width: 64px;
				height: 64px;
				top: 0;
				left: 0;
				z-index: 2;
				background: rgba(17, 17, 17, .7);
				color: #fff;

				> .icon {
					margin: auto;
				}
			}
		}
	}

	> .remain {
		display: block;
		position: absolute;
		top: 8px;
		right: 8px;
		margin: 0;
		padding: 0;
	}

	> .remain {
		position: absolute;
		top: 0;
		right: 0;
		padding: 4px 8px;
		font-size: 0.9em;
		color: var(--fg);
		min-width: 1.6em;
		pointer-events: none;
		white-space: nowrap;
		opacity: 0.8;

		&.over {
			color: var(--error);
		}
	}
}
</style>
