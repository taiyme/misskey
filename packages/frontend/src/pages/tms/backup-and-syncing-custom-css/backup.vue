<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<div :class="$style.buttons">
		<MkButton inline primary @click="saveNew">{{ i18n.ts.createNew }}</MkButton>
		<MkButton inline @click="upload">{{ i18n.ts.upload }}</MkButton>
	</div>
	<template v-if="customCssBackups.length === 0">
		<MkInfo>{{ i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.notfound }}</MkInfo>
	</template>
	<template v-else>
		<div class="_gaps_s">
			<div
				v-for="backup in customCssBackups" :key="backup.id" class="_panel" :class="$style.profile"
				@click="($event: MouseEvent) => menu($event, backup.id)"
				@contextmenu.prevent.stop="($event: MouseEvent) => menu($event, backup.id)"
			>
				<div :class="$style.name">{{ backup.name }}</div>
				<div :class="$style.time">{{ i18n.tsx._tms._flags._backupAndSyncingCustomCss._backup.createdAt({ datetime: new Date(backup.createAt).toLocaleString() }) }}</div>
			</div>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { v4 as uuid } from 'uuid';
import { apiWithDialog, inputText, popupMenu, confirm } from '@/os.js';
import { miLocalStorage } from '@/local-storage.js';
import { unisonReload } from '@/scripts/unison-reload.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import MkInfo from '@/components/MkInfo.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { codePreview } from '@/tms/popup.js';

export type CustomCSSBackup = {
	id: string;
	name: string;
	createAt: string;
	updatedAt: string;
	customCss: string;
};
export type CustomCSSBackups = CustomCSSBackup[];

const scope = ['tms', 'customCssBackups'] as const satisfies string[];

const customCssBackups = ref<CustomCSSBackups>([]);

const saveNew = async () => {
	const customCss = miLocalStorage.getItem('customCss') ?? '';
	if (!customCss) {
		await confirm({
			type: 'error',
			title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.noCustomCss,
			text: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.noCustomCssDescription,
		});

		return;
	}

	const { canceled, result: name } = await inputText({
		title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.inputBackupName,
		default: '',
	});
	if (canceled) {
		return;
	}

	const backup: CustomCSSBackup = {
		id: uuid(),
		name,
		createAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
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

const upload = async () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = false;
	input.onchange = async () => {
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];

		if (file.type !== 'application/json') {
			return alert({
				type: 'error',
				title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.cannnotLoad,
				text: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.invalidFile,
			});
		}

		let json: { [key: string]: unknown };
		try {
			json = JSON.parse(await file.text());
		} catch (err) {
			return alert({
				type: 'error',
				title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.cannnotLoad,
				text: (err as SyntaxError).message,
			});
		}
		const result = validate(json);
		if (!result.valid) {
			return alert({
				type: 'error',
				title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.cannnotLoad,
				text: result.error,
			});
		}

		await apiWithDialog('i/registry/set', { scope, key: result.value.id, value: result.value });

		// 一応廃棄
		window['__misskey_input_ref__'] = null;
	};

	// https://qiita.com/fukasawah/items/b9dc732d95d99551013d
	// iOS Safari で正常に動かす為のおまじない
	window['__misskey_input_ref__'] = input;

	input.click();
};

const validate = (json: { [key: string]: unknown }): { valid: true, value: CustomCSSBackup } | { valid: false, error: string } => {
	const uuidv4Matcher = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
	if ('id' in json && (typeof json.id !== 'string' || !uuidv4Matcher.test(json.id) || customCssBackups.value.some((b) => b.id === json.id))) {
		json.id = uuid();
	}
	if ('name' in json && typeof json.name !== 'string') {
		return {
			valid: false,
			error: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.invalidName,
		};
	}
	if ('createAt' in json && typeof json.createAt !== 'string') {
		json.createAt = new Date().toISOString();
	}
	if ('updatedAt' in json && typeof json.updatedAt !== 'string') {
		json.updatedAt = new Date().toISOString();
	}
	if ('customCss' in json && (typeof json.customCss !== 'string' || json.customCss.length === 0)) {
		return {
			valid: false,
			error: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.invalidCustomCss,
		};
	}

	return {
		valid: true,
		value: json as CustomCSSBackup,
	};
};

const applyBackup = async (backupId: string) => {
	const backup = customCssBackups.value.find((p) => p.id === backupId);
	if (!backup) {
		return;
	}

	const { canceled } = await confirm({
		type: 'info',
		title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.applyBackup,
		text: i18n.tsx._tms._flags._backupAndSyncingCustomCss._backup.applyBackupDescription({ name: backup.name }),
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
		title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.inputBackupName,
		default: backup.name,
	});
	if (canceled) {
		return;
	}

	backup.updatedAt = new Date().toISOString();
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
			title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.noCustomCss,
			text: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.cannotOverrideEmpty,
		});

		return;
	}

	const { canceled } = await confirm({
		type: 'warning',
		title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.overrideBackup,
		text: i18n.tsx._tms._flags._backupAndSyncingCustomCss._backup.overrideBackupDescription({ name: backup.name }),
	});
	if (canceled) {
		return;
	}

	backup.updatedAt = new Date().toISOString();
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
		title: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.deleteBackup,
		text: i18n.tsx._tms._flags._backupAndSyncingCustomCss._backup.deleteBackupDescription({ name: profile.name }),
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

const preview = async (backupId: string) => {
	const backup = customCssBackups.value.find((p) => p.id === backupId);
	if (!backup) {
		return;
	}

	await codePreview({
		name: backup.name,
		lang: 'css',
		code: backup.customCss,
	});
};

const menu = (ev: MouseEvent, backupId: string) => {
	const profile = customCssBackups.value.find((p) => p.id === backupId);
	if (!profile) {
		return;
	}

	return popupMenu([{
		text: i18n.ts.apply,
		icon: 'ti ti-cloud-upload',
		action: () => applyBackup(backupId),
	}, {
		text: i18n.ts.rename,
		icon: 'ti ti-forms',
		action: () => renameBackup(backupId),
	}, {
		text: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.preview,
		icon: 'ti ti-eye-code',
		action: () => preview(backupId),
	}, {
		text: i18n.ts._tms._flags._backupAndSyncingCustomCss._backup.override,
		icon: 'ti ti-device-floppy',
		action: () => overrideBackup(backupId),
	}, {
		type: 'a',
		text: i18n.ts.download,
		icon: 'ti ti-download',
		href: URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })),
		download: `${profile.name}.json`,
	}, {
		type: 'divider',
	}, {
		text: i18n.ts.delete,
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
.buttons {
	display: flex;
	gap: var(--margin);
	flex-wrap: wrap;
}

.profile {
	padding: 20px;
	cursor: pointer;

	> .name {
		font-weight: 700;
	}

	> .time {
		font-size: 0.85em;
		opacity: 0.7;
	}
}
</style>
