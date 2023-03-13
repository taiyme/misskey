import { markRaw } from 'vue';
import { Storage } from '@/pizzax';

export const tmsStore = markRaw(new Storage('tms', {
	doNotMigrate: {
		where: 'device',
		default: false,
	},
	migrated: {
		where: 'account',
		default: false,
	},
	verticalInstanceTicker: {
		where: 'account',
		default: true,
	},
	useReactionMenu: {
		where: 'account',
		default: true,
	},
	collapseNote: {
		where: 'account',
		default: true,
	},
	collapseNoteHeight: {
		where: 'account',
		default: 500,
	},
	collapseNoteFile: {
		where: 'account',
		default: 5,
	},
	collapseNoteUrl: {
		where: 'account',
		default: 4,
	},
	collapseNotePoll: {
		where: 'account',
		default: 5,
	},
	collapseRenote: {
		where: 'account',
		default: false,
	},
	usePakuru: {
		where: 'account',
		default: false,
	},
	useNumberquote: {
		where: 'account',
		default: false,
	},
	useImanonashi: {
		where: 'account',
		default: false,
	},
	imanonashiWords: {
		where: 'account',
		default: ['/^いまのなし$/'] as (string | string[])[],
	},
	imanonashiConfirm: {
		where: 'account',
		default: true,
	},
	imanonashiItself: {
		where: 'account',
		default: false,
	},
}));
