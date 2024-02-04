<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<div>
		<MkButton inline primary @click="saveNew">新規作成</MkButton>
	</div>
	<template v-if="customCssBackups.length === 0">
		<MkInfo>バックアップがありません。「新規作成」で現在適用されているカスタムCSSのバックアップを作成できます。</MkInfo>
	</template>
	<template v-else>
		<div class="_gaps_s">
			<div
				v-for="backup in customCssBackups" :key="backup.id" class="_panel" :class="$style.profile"
				@click="($event: MouseEvent) => menu($event, backup.id)"
				@contextmenu.prevent.stop="($event: MouseEvent) => menu($event, backup.id)"
			>
				<div :class="$style.name">{{ backup.name }}</div>
				<div :class="$style.time">作成日: {{ new Date(backup.createAt).toLocaleString() }}</div>
			</div>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { v4 } from 'uuid';
import { apiWithDialog, inputText, popupMenu, confirm } from '@/os.js';
import { miLocalStorage } from '@/local-storage.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import MkInfo from '@/components/MkInfo.vue';
import MkButton from '@/components/MkButton.vue';

type CustomCSSBackup = {
	id: string;
	name: string;
	createAt: string;
	customCss: string;
};
type CustomCSSBackups = CustomCSSBackup[];

const scope = ['tms', 'customCssBackups'];

const customCssBackups = ref<CustomCSSBackups>([]);

const saveNew = async () => {
	const customCss = miLocalStorage.getItem('customCss') ?? '';
	if (!customCss) {
		await confirm({
			type: 'error',
			title: 'カスタムCSSが設定されていません',
			text: 'カスタムCSSを設定されていない状態ではバックアップを作成できません。',
		});

		return;
	}

	const { canceled, result: name } = await inputText({
		title: 'バックアップ名を入力',
	});
	if (canceled) {
		return;
	}

	const backup: CustomCSSBackup = {
		id: v4(),
		name,
		createAt: new Date().toISOString(),
		customCss: miLocalStorage.getItem('customCss') ?? '',
	};

	await apiWithDialog('i/registry/set', {
		scope,
		key: backup.id,
		value: backup,
	});

	misskeyApi('i/registry/get-all', {
		scope,
	}).then(res => {
		customCssBackups.value = Object.values(res);
	});
};

const applyBackup = async (backupId: string) => {
	const backup = customCssBackups.value.find((p) => p.id === backupId);
	if (!backup) {
		return;
	}

	const { canceled } = await confirm({
		type: 'info',
		title: 'カスタムCSSのバックアップを適用',
		text: `カスタムCSSのバックアップ「${backup.name}」を適用しますか？`,
	});
	if (canceled) {
		return;
	}

	miLocalStorage.setItem('customCss', backup.customCss);

	unisonReload();
};

const renameBackup = async (backupId: string) => {
	const backup = customCssBackups.value.find((p) => p.id === backupId);
	if (!backup) {
		return;
	}

	const { canceled, result: name } = await inputText({
		title: 'バックアップ名を入力',
		default: backup.name,
	});
	if (canceled) {
		return;
	}

	backup.name = name;

	await apiWithDialog('i/registry/set', {
		scope,
		key: backup.id,
		value: backup,
	});
};

const overrideBackup = async (backupId: string) => {
	const backup = customCssBackups.value.find((p) => p.id === backupId);
	if (!backup) {
		return;
	}

	const customCss = miLocalStorage.getItem('customCss') ?? '';
	if (!customCss) {
		await confirm({
			type: 'error',
			title: 'カスタムCSSが設定されていません',
			text: 'カスタムCSSを設定されていない状態では上書き保存できません。\nカスタムCSSのバックアップを削除する場合はメニューから「削除」を選択してください。',
		});

		return;
	}

	const { canceled } = await confirm({
		type: 'warning',
		title: 'カスタムCSSのバックアップを上書き',
		text: `カスタムCSSのバックアップ「${backup.name}」を現在のカスタムCSSで上書きします。この操作は取り消せません。`,
	});
	if (canceled) {
		return;
	}

	backup.customCss = customCss;

	await apiWithDialog('i/registry/set', {
		scope,
		key: backup.id,
		value: backup,
	});
};

const deleteBackup = async (backupId: string) => {
	const profile = customCssBackups.value.find((p) => p.id === backupId);
	if (!profile) {
		return;
	}

	const { canceled } = await confirm({
		type: 'warning',
		title: 'カスタムCSSのバックアップを削除',
		text: `カスタムCSSのバックアップ「${profile.name}」を削除します。この操作は取り消せません。`,
	});
	if (canceled) {
		return;
	}

	await apiWithDialog('i/registry/remove', {
		scope,
		key: profile.id,
	});

	misskeyApi('i/registry/get-all', {
		scope,
	}).then(res => {
		customCssBackups.value = Object.values(res);
	});
};

const menu = (ev: MouseEvent, backupId: string) => {
	const profile = customCssBackups.value.find((p) => p.id === backupId);
	if (!profile) {
		return;
	}

	return popupMenu([{
		text: '適用',
		icon: 'ti ti-cloud-upload',
		action: () => applyBackup(backupId),
	}, {
		text: '名前を変更',
		icon: 'ti ti-forms',
		action: () => renameBackup(backupId),
	}, {
		text: '上書き保存',
		icon: 'ti ti-device-floppy',
		action: () => overrideBackup(backupId),
	}, {
		type: 'a',
		text: 'ダウンロード',
		icon: 'ti ti-download',
		href: URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })),
		download: `${profile.name}.json`,
	}, {
		type: 'divider',
	}, {
		text: '削除',
		icon: 'ti ti-trash',
		danger: true,
		action: () => deleteBackup(backupId),
	}], (ev.currentTarget ?? ev.target ?? undefined) as HTMLElement | undefined);
};

onMounted(() => {
	misskeyApi('i/registry/get-all', {
		scope,
	}).then(res => {
		customCssBackups.value = Object.values(res);
	});
});

defineExpose({
	customCssBackups,
});

</script>

<style lang="scss" module>
.profile {
	padding: 20px;
	cursor: pointer;
	border: var(--panelBorder);

	> .name {
		font-weight: 700;
	}

	> .time {
		font-size: 0.85em;
		opacity: 0.7;
	}
}</style>
