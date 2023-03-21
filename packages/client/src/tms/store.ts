import { markRaw } from 'vue';
import { Storage } from '@/pizzax';

export const tmsStore = markRaw(new Storage('tms', {
	instanceTickerPosition: {
		where: 'account',
		default: 'leftedge' as 'normal' | 'leftedge' | 'rightedge' | 'bottomleft' | 'bottomright',
	},
	useReactionMenu: {
		where: 'account',
		default: true,
	},
	showActionsOnlyOnHover: {
		where: 'account',
		default: false,
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
