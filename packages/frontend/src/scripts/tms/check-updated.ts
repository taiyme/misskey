/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { compareVersions } from 'compare-versions';
import { miLocalStorage } from '@/local-storage.js';
import { commitHash, version } from '@/config.js';

export const checkUpdated = async (): Promise<{
	isThemeRemoved: boolean;
	isClientUpdated: boolean;
	isCommitChanged: boolean;
}> => {
	let isThemeRemoved = false;
	let isClientUpdated = false;
	let isCommitChanged = false;

	const lastVersion = miLocalStorage.getItem('lastVersion');
	const lastCommitHash = miLocalStorage.getItem('lastCommitHash');
	if (lastVersion === version && lastCommitHash === commitHash) {
		return { isThemeRemoved, isClientUpdated, isCommitChanged };
	}

	miLocalStorage.removeItem('theme');
	isThemeRemoved = true;

	try {
		isClientUpdated = lastVersion != null && compareVersions(version, lastVersion) === 1;
	} catch {}

	isCommitChanged = true;

	miLocalStorage.setItem('lastVersion', version);
	miLocalStorage.setItem('lastCommitHash', commitHash);
	return { isThemeRemoved, isClientUpdated, isCommitChanged };
};
