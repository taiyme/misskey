import { noteVisibilities } from 'misskey-js';
import { deepClone } from '@/scripts/clone';
import { arrayAt } from '@/scripts/tms/utils';

type Note<T = typeof noteVisibilities[number]> = {
	visibility: T;
	localOnly: boolean;
	visibleUserIds: string[];
};

const getDisabledVisibilities = (vis: Note['visibility']): Note['visibility'][] => {
	const visibilities = ['public', 'home', 'followers', 'specified'] as const;
	const index = visibilities.indexOf(vis);
	if (index === -1) throw new Error(`Invalid visibility: ${vis}`);
	return visibilities.slice(0, index);
};

const isPublic = (v: Note): v is Note<'public'> => v.visibility === 'public';
const isHome = (v: Note): v is Note<'home'> => v.visibility === 'home';
const isFollowers = (v: Note): v is Note<'followers'> => v.visibility === 'followers';
const isSpecified = (v: Note): v is Note<'specified'> => v.visibility === 'specified';

export const migrateNoteVisibility = (props: {
	note: Note;
	reply?: Note | null;
	renote?: Note | null;
}): Note & {
	disabledVisibilities: Note['visibility'][];
} => {
	const { note, reply, renote } = deepClone(props);
	const order: Note[] = [note, reply, renote].flatMap(x => x ? [x] : []);

	if (order.length <= 1) {
		const orderNote = arrayAt(order, 0);
		if (orderNote) return {
			...orderNote,
			disabledVisibilities: getDisabledVisibilities(orderNote.visibility),
		};
		throw new Error();
	}

	if (order.every(isPublic)) {
		return {
			visibility: 'public',
			localOnly: order.some(x => x.localOnly === true),
			visibleUserIds: [],
			disabledVisibilities: getDisabledVisibilities('public'),
		};
	}

	if (order.some(isSpecified)) {
		return {
			visibility: 'specified',
			localOnly: false,
			visibleUserIds: [...new Set<string>(order.flatMap(({ visibleUserIds }) => visibleUserIds))],
			disabledVisibilities: getDisabledVisibilities('specified'),
		};
	}

	if (order.some(isFollowers)) {
		return {
			visibility: 'followers',
			localOnly: order.some(x => x.localOnly === true),
			visibleUserIds: [],
			disabledVisibilities: getDisabledVisibilities('followers'),
		};
	}

	if (order.some(isHome)) {
		return {
			visibility: 'home',
			localOnly: order.some(x => x.localOnly === true),
			visibleUserIds: [],
			disabledVisibilities: getDisabledVisibilities('home'),
		};
	}

	throw new Error();
};
