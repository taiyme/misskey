import { markRaw } from 'vue';
import { Storage } from '@/pizzax';

type TmsIsLong = {
	enabled: boolean,
	textElHeight: number,
	filesLength: number,
	urlsLength: number,
	pollLength: number,
}
type TmsImanonashi = {
	enabled: boolean,
	words: (string | string[])[],
	confirm: boolean,
	delete: boolean,
}

export const tmsStore = markRaw(new Storage('tms', {
	tmsVerticalInstanceTicker: {
		where: 'account',
		default: true,
	},
	tmsIsLong: {
		where: 'account',
		default: {
			enabled: true,
			textElHeight: 500,
			filesLength: 5,
			urlsLength: 4,
			pollLength: 5,
		} as TmsIsLong,
	},
	tmsRenoteCollapsedEnabled: {
		where: 'account',
		default: false,
	},
	tmsPakuruEnabled: {
		where: 'account',
		default: false,
	},
	tmsNumberquoteEnabled: {
		where: 'account',
		default: false,
	},
	tmsImanonashi: {
		where: 'account',
		default: {
			enabled: false,
			words: ['/^いまのなし$/'],
			confirm: true,
			delete: false,
		} as TmsImanonashi,
	},
}));
