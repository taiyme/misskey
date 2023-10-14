/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed, createApp, watch, markRaw, version as vueVersion, defineAsyncComponent } from 'vue';
import { common } from './common.js';

export async function subBoot() {
	const { isThemeRemoved, isClientUpdated, isCommitChanged } = await common(() => createApp(
		defineAsyncComponent(() => import('@/ui/minimum.vue')),
	));
}
