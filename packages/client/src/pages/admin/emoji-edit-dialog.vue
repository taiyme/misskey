<template>
<MkModalWindow
	ref="dialog"
	:width="370"
	:with-ok-button="true"
	@close="dialog?.close()"
	@closed="emit('closed')"
	@ok="ok()"
>
	<template #header>:{{ emoji.name }}:</template>

	<div class="_monolithic_">
		<div class="yigymqpb _section">
			<img :src="emoji.url" class="img"/>
			<MkInput v-model="name" class="_formBlock">
				<template #label>{{ i18n.ts.name }}</template>
			</MkInput>
			<MkInput v-model="category" class="_formBlock" :datalist="categories">
				<template #label>{{ i18n.ts.category }}</template>
			</MkInput>
			<MkInput v-model="aliases" class="_formBlock">
				<template #label>{{ i18n.ts.tags }}</template>
				<template #caption>{{ i18n.ts.setMultipleBySeparatingWithSpace }}</template>
			</MkInput>
			<MkButton danger @click="del()"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { CustomEmoji } from 'misskey-js/built/entities';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/form/input.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { emojiCategories } from '@/instance';

type EditedCustomEmoji = Omit<CustomEmoji, 'url'>;

const props = defineProps<{
	emoji: CustomEmoji;
}>();

const emit = defineEmits<{
	(ev: 'done', v: { deleted?: boolean, updated?: EditedCustomEmoji }): void,
	(ev: 'closed'): void
}>();

const dialog = $ref<InstanceType<typeof MkModalWindow> | null>(null);
let name: string = $ref(props.emoji.name);
let category: string = $ref(props.emoji.category);
let aliases: string = $ref(props.emoji.aliases.join(' '));
const categories: string[] = $ref(emojiCategories);

const ok = (): void => {
	update();
};

const update = async (): Promise<void> => {
	await os.apiWithDialog('admin/emoji/update', {
		id: props.emoji.id,
		name,
		category,
		aliases: aliases.split(' '),
	});

	emit('done', {
		updated: {
			id: props.emoji.id,
			name,
			category,
			aliases: aliases.split(' '),
		},
	});

	dialog?.close();
};

const del = async (): Promise<void> => {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('removeAreYouSure', { x: name }),
	});
	if (canceled) return;

	os.api('admin/emoji/delete', {
		id: props.emoji.id,
	}).then(() => {
		emit('done', {
			deleted: true,
		});
		dialog?.close();
	});
};
</script>

<style lang="scss" scoped>
.yigymqpb {
	> .img {
		display: block;
		height: 64px;
		margin: 0 auto;
	}
}
</style>
