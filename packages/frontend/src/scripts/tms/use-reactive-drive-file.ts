/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type MaybeRefOrGetter, onUnmounted, ref, toValue, watch, computed, onDeactivated, onMounted, onActivated } from 'vue';
import type * as Misskey from 'misskey-js';
import { $i } from '@/account.js';
import { defaultStore } from '@/store.js';
import { deepClone } from '@/scripts/clone.js';
import { useCleanup } from '@/scripts/tms/use-cleanup.js';

export const useReactiveDriveFile = (driveFile: MaybeRefOrGetter<Misskey.entities.DriveFile>) => {
	const reactiveDriveFile = ref(deepClone(toValue(driveFile)));
	const reactiveHide = ref(true);
	const reactiveSensitive = ref(false);
	const reactiveIAmOwner = computed(() => {
		if ($i == null) return false;
		if (reactiveDriveFile.value.userId == null) return false;
		return $i.id === reactiveDriveFile.value.userId;
	});

	const { addCleanup, cleanup } = useCleanup();
	onMounted(() => init());
	onActivated(() => init());
	onUnmounted(() => reset());
	onDeactivated(() => reset());

	let inited = false;
	const init = () => {
		if (inited) return;
		inited = true;

		addCleanup(watch(
			() => deepClone(toValue(driveFile)),
			(newDriveFile) => {
				reactiveDriveFile.value = newDriveFile;
			},
			{ deep: true },
		));

		addCleanup(watch(
			reactiveDriveFile,
			() => {
				if (defaultStore.state.nsfw === 'force' || defaultStore.state.dataSaver.media) {
					reactiveHide.value = true;
				} else if (defaultStore.state.nsfw === 'ignore') {
					reactiveHide.value = false;
				} else {
					reactiveHide.value = reactiveDriveFile.value.isSensitive;
				}
				if (defaultStore.state.highlightSensitiveMedia) {
					reactiveSensitive.value = reactiveDriveFile.value.isSensitive;
				} else {
					reactiveSensitive.value = false;
				}
			},
			{ deep: true, immediate: true },
		));
	};

	const reset = () => {
		cleanup();
		inited = false;
	};

	return {
		reactiveDriveFile,
		reactiveHide,
		reactiveSensitive,
		reactiveIAmOwner,
	} as const;
};
