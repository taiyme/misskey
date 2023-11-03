/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createApp, defineAsyncComponent } from 'vue';
import { common } from './common.js';

export async function subBoot() {
	const { isThemeRemoved, isClientUpdated, isCommitChanged } = await common(() => createApp(useUi()));
}

function useUi() {
	return defineAsyncComponent(() => import('@/ui/minimum.vue'));
}
