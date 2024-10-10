/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ComputedRef, Ref } from 'vue';
import type * as Misskey from 'misskey-js';
import type { MenuItem } from '@/types/menu.js';
import { iAmModerator } from '@/account.js';
import { i18n } from '@/i18n.js';
import { apiWithDialog } from '@/os.js';

export const getMediaMenu = (props: {
	readonly reactiveDriveFile: Ref<Misskey.entities.DriveFile>; // reactive
	readonly reactiveHide: Ref<boolean>; // reactive
	readonly reactiveSensitive: Ref<boolean>; // reactive
	readonly reactiveIAmOwner: ComputedRef<boolean>; // reactive
	readonly mock: boolean;
	readonly additionalMenu?: MenuItem[];
}) => {
	const menu = new Set<MenuItem>();

	menu.add({
		text: i18n.ts.hide,
		icon: 'ti ti-eye-off',
		action: () => {
			props.reactiveHide.value = true;
		},
	});

	if (props.additionalMenu != null && props.additionalMenu.length > 0) {
		menu.add({ type: 'divider' });
		props.additionalMenu.forEach(menuItem => menu.add(menuItem));
	}

	if (!props.mock && props.reactiveIAmOwner.value) {
		menu.add({ type: 'divider' });
		menu.add({
			type: 'link',
			to: `/my/drive/file/${props.reactiveDriveFile.value.id}`,
			text: i18n.ts._fileViewer.title,
			icon: 'ti ti-info-circle',
		});
	}

	if (!props.mock && iAmModerator) {
		menu.add({ type: 'divider' });
		menu.add({
			type: 'label',
			text: i18n.ts.moderation,
		});
		menu.add({
			type: 'link',
			to: `/admin/file/${props.reactiveDriveFile.value.id}`,
			text: i18n.ts._fileViewer.title,
			icon: 'ti ti-info-circle',
		});
		// リアクティブ性を切らないとtextとactionで挙動が一致しなくなることがある
		const tempIsSensitive = props.reactiveDriveFile.value.isSensitive;
		menu.add({
			text: tempIsSensitive ? i18n.ts.unmarkAsSensitive : i18n.ts.markAsSensitive,
			icon: tempIsSensitive ? 'ti ti-eye' : 'ti ti-eye-exclamation',
			danger: true,
			action: () => {
				apiWithDialog('drive/files/update', {
					fileId: props.reactiveDriveFile.value.id,
					isSensitive: !tempIsSensitive,
				}).then(({ isSensitive }) => {
					props.reactiveDriveFile.value.isSensitive = isSensitive;
				});
			},
		});
	}

	return Array.from(menu.values());
};
