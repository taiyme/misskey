<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div v-if="channelId == null || channel != null" class="_gaps_m">
			<MkInput v-model="params.name" :disabled="computedIsArchived">
				<template #label>{{ i18n.ts.name }}</template>
			</MkInput>

			<MkTextarea v-model="params.description" :disabled="computedIsArchived">
				<template #label>{{ i18n.ts.description }}</template>
			</MkTextarea>

			<MkColorInput v-model="params.color" :disabled="computedIsArchived">
				<template #label>{{ i18n.ts.color }}</template>
			</MkColorInput>

			<MkSwitch v-model="params.isSensitive" :disabled="computedIsArchived">
				<template #label>{{ i18n.ts.sensitive }}</template>
			</MkSwitch>

			<div>
				<div v-if="params.bannerUrl">
					<img :src="params.bannerUrl" style="width: 100%;"/>
					<MkButton @click="removeBannerImage()" :disabled="computedIsArchived"><i class="ti ti-trash"></i> {{ i18n.ts._channel.removeBanner }}</MkButton>
				</div>
				<MkButton v-else @click="setBannerImage" :disabled="computedIsArchived"><i class="ti ti-plus"></i> {{ i18n.ts._channel.setBanner }}</MkButton>
			</div>

			<MkFolder :defaultOpen="true">
				<template #label>{{ i18n.ts.pinnedNotes }}</template>

				<div class="_gaps">
					<MkButton primary rounded @click="addPinnedNote()" :disabled="computedIsArchived"><i class="ti ti-plus"></i></MkButton>

					<Sortable
						v-model="params.pinnedNotes"
						itemKey="id"
						:handle="'.' + $style.pinnedNoteHandle"
						:animation="150"
						:disabled="computedIsArchived"
					>
						<template #item="{element,index}">
							<div :class="$style.pinnedNote">
								<button class="_button" :class="$style.pinnedNoteHandle"><i class="ti ti-menu"></i></button>
								{{ element.id }}
								<button class="_button" :class="$style.pinnedNoteRemove" @click="removePinnedNote(index)"><i class="ti ti-x"></i></button>
							</div>
						</template>
					</Sortable>
				</div>
			</MkFolder>

			<div class="_buttons">
				<MkButton primary @click="save()" :disabled="computedIsArchived"><i class="ti ti-device-floppy"></i> {{ channelId ? i18n.ts.save : i18n.ts.create }}</MkButton>
				<MkButton v-if="computedIsArchived" danger @click="unarchive()" :disabled="!computedIsArchived"><i class="ti ti-arrow-back-up"></i> {{ i18n.ts._tms.undo }}</MkButton>
				<MkButton v-else-if="channelId" danger @click="archive()" :disabled="computedIsArchived"><i class="ti ti-trash"></i> {{ i18n.ts.archive }}</MkButton>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, defineAsyncComponent } from 'vue';
import type * as Misskey from 'misskey-js';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkColorInput from '@/components/MkColorInput.vue';
import { selectFile } from '@/scripts/select-file.js';
import * as os from '@/os.js';
import { useRouter } from '@/router.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from "@/components/MkSwitch.vue";

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const router = useRouter();

const props = defineProps<{
	channelId?: string;
}>();

const channel = ref<Misskey.entities.Channel | null>(null);
const params = reactive<{
	name: string;
	description: string;
	bannerId: string | null; // send
	bannerUrl: string | null; // view
	color: string;
	isSensitive: boolean;
	pinnedNotes: {
		id: string;
	}[];
}>({
	name: '',
	description: '',
	bannerId: null,
	bannerUrl: null,
	color: '#000',
	isSensitive: false,
	pinnedNotes: [],
});

// TODO: channels/update でバナーを削除できない？
const computedBannerId = computed<string | null | undefined>(() => {
	if (params.bannerId) return params.bannerId; // bannerId があればそれを使う
	if (params.bannerUrl) return undefined; // bannerUrl があれば undefined (維持)
	return null; // それ以外は null (削除)
});

const computedIsArchived = computed(() => {
	return channel.value?.isArchived ?? false;
});

const fetchChannel = async (updated?: Misskey.entities.Channel): Promise<void> => {
	if (!props.channelId) return;

	channel.value = updated ? updated : await os.api('channels/show', {
		channelId: props.channelId,
	});

	params.name = channel.value.name;
	params.description = channel.value.description ?? '';
	params.bannerId = null;
	params.bannerUrl = channel.value.bannerUrl;
	params.color = channel.value.color;
	params.isSensitive = channel.value.isSensitive;
	params.pinnedNotes = channel.value.pinnedNoteIds.map(id => ({ id }));
};

fetchChannel();

const addPinnedNote = async (): Promise<void> => {
	// TODO: lookupNoteなどを定義して切り分ける
	const { canceled, result: value } = await os.inputText({
		title: i18n.ts.noteIdOrUrl,
	});
	if (canceled) return;
	const noteId = value.includes('/') ? value.split('/').pop() ?? value : value;
	const note = await os.apiWithDialog('notes/show', { noteId });
	params.pinnedNotes.unshift({ id: note.id });
};

const removePinnedNote = (index: number): void => {
	params.pinnedNotes.splice(index, 1);
};

const setBannerImage = (evt: MouseEvent): void => {
	selectFile(evt.currentTarget ?? evt.target, null).then(file => {
		params.bannerId = file.id;
		params.bannerUrl = file.url;
	});
};

const removeBannerImage = (): void => {
	params.bannerId = null;
	params.bannerUrl = null;
};

const archive = async (): Promise<void> => {
	if (!props.channelId) return;

	const { canceled } = await os.confirm({
		type: 'warning',
		title: i18n.t('channelArchiveConfirmTitle', {
			name: params.name,
		}),
		text: i18n.ts.channelArchiveConfirmDescription,
	});
	if (canceled) return;

	os.api('channels/update', {
		channelId: props.channelId,
		isArchived: true,
	}).then((updated) => {
		os.success();
		fetchChannel(updated);
	});
};

const unarchive = async (): Promise<void> => {
	if (!props.channelId) return;

	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.ts._tms.undoConfirm,
	});
	if (canceled) return;

	os.api('channels/update', {
		channelId: props.channelId,
		isArchived: false,
	}).then((updated) => {
		os.success();
		fetchChannel(updated);
	});
};

const save = (): void => {
	const req: Misskey.Endpoints['channels/create']['req'] = {
		name: params.name.trim(),
		description: params.description.trim() || null, // nullable
		bannerId: computedBannerId.value, // nullable, undefinedable
		color: params.color.trim() || '#000',
		isSensitive: params.isSensitive,
	};
	const pinnedNoteIds = params.pinnedNotes.map(({ id }) => id);

	if (props.channelId) {
		// TODO: channels/update でバナーを削除できない？
		os.api('channels/update', {
			...req,
			pinnedNoteIds,
			channelId: props.channelId,
		}).then((updated) => {
			os.success();
			fetchChannel(updated);
		});
	} else {
		os.api('channels/create', req).then(async (created) => {
			// TODO: channels/create でpinnedNoteIdsを指定できない
			await os.api('channels/update', {
				pinnedNoteIds,
				channelId: created.id,
			}).catch(() => {}); // チャンネル自体は作成できているので、エラーを無視する
			os.success();
			fetchChannel(created);
			router.push(`/channels/${created.id}`);
		});
	}
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => props.channelId ? {
	title: i18n.ts._channel.edit,
	icon: 'ti ti-device-tv',
} : {
	title: i18n.ts._channel.create,
	icon: 'ti ti-device-tv',
}));
</script>

<style lang="scss" module>
.pinnedNote {
	position: relative;
	display: block;
	line-height: 2.85rem;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	color: var(--navFg);
}

.pinnedNoteRemove {
	position: absolute;
	z-index: 10000;
	width: 32px;
	height: 32px;
	color: #ff2a2a;
	right: 8px;
	opacity: 0.8;
}

.pinnedNoteHandle {
	cursor: move;
	width: 32px;
	height: 32px;
	margin: 0 8px;
	opacity: 0.5;
}
</style>
