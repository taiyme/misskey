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
	tickerPosition: {
		where: 'account',
		default: 'default' as import('@/components/TmsInstanceTicker.impl.js').TickerPosition,
	},
	superMenuDisplayMode: {
		where: 'deviceAccount',
		default: 'default' as 'default' | 'classic' | 'forceList',
	},
	pullToRefreshSensitivity: {
		where: 'device',
		default: 'middle' as 'low' | 'middle' | 'high',
	},
	pullToRefreshAllReload: {
		where: 'device',
		default: false,
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
