import { markRaw } from 'vue';
import { Storage } from '@/pizzax.js';

//#region test
const e = '';
//#endregion

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
		default: 'default' as import('@/components/TmsSuperMenu.impl.js').SuperMenuDisplayMode,
	},
	pullToRefreshSensitivity: {
		where: 'device',
		default: 'middle' as 'low' | 'middle' | 'high',
	},
	pullToRefreshAllReload: {
		where: 'device',
		default: false,
	},
}));
