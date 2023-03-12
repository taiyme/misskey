import { markRaw } from 'vue';
import { Storage } from '@/pizzax';

export const tmsStore = markRaw(new Storage('tms', {
	verticalInstanceTicker: {
		where: 'device',
		default: true,
	},
	useReactionMenu: {
		where: 'device',
		default: true,
	},
	isLongEnabled: {
		where: 'device',
		default: true,
	},
	isLongTextElHeight: {
		where: 'device',
		default: 500,
	},
	isLongFilesLength: {
		where: 'device',
		default: 5,
	},
	isLongUrlsLength: {
		where: 'device',
		default: 4,
	},
	isLongPollLength: {
		where: 'device',
		default: 5,
	},
	renoteCollapsedEnabled: {
		where: 'device',
		default: false,
	},
	pakuruEnabled: {
		where: 'device',
		default: false,
	},
	numberquoteEnabled: {
		where: 'device',
		default: false,
	},
	imanonashiEnabled: {
		where: 'device',
		default: false,
	},
	imanonashiWords: {
		where: 'device',
		default: ['/^いまのなし$/'] as (string | string[])[],
	},
	imanonashiConfirmEnabled: {
		where: 'device',
		default: true,
	},
	imanonashiDeleteEnabled: {
		where: 'device',
		default: false,
	},
}));
