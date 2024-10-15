/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw } from 'vue';
import { Storage } from '@/pizzax.js';

/**
 * tmsFlaskStore -- 独自実装した実験的機能についてのデータを格納する
 */
export const tmsFlaskStore = markRaw(new Storage('tmsFlask', {
	preventLongPressContextMenu: {
		where: 'device',
		default: false,
	},
	enabledCustomCssSyncing: {
		where: 'deviceAccount',
		default: false,
	},
	syncingCustomCssId: {
		where: 'deviceAccount',
		default: null as string | null,
	},
}));
