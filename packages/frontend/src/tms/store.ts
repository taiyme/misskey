/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw } from 'vue';
import { Storage } from '@/pizzax.js';

/**
 * tmsStore -- 独自実装した機能についてのデータを格納する
 */
export const tmsStore = markRaw(new Storage('tmsMain', {
	superMenuDisplayMode: {
		where: 'deviceAccount',
		default: 'default' as 'default' | 'classic' | 'forceList',
	},
	enablePakuru: {
		where: 'device',
		default: false,
	},
	enableNumberquote: {
		where: 'device',
		default: false,
	},
}));
