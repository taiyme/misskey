import { Antenna } from '@/models/entities/antenna.js';
import { Note } from '@/models/entities/note.js';
import { User } from '@/models/entities/user.js';
import { UserListJoinings, UserGroupJoinings, Blockings, Notes } from '@/models/index.js';
import { getFullApAccount } from './convert-host.js';
import * as Acct from '@/misc/acct.js';
import { Packed } from './schema.js';
import { Cache } from './cache.js';

const blockingCache = new Cache<User['id'][]>(1000 * 60 * 5);

// NOTE: フォローしているユーザーのノート、リストのユーザーのノート、グループのユーザーのノート指定はパフォーマンス上の理由で無効になっている

export async function checkHitAntenna(antenna: Antenna, note: (Note | Packed<'Note'>), noteUser: { id: User['id']; username: string; host: string | null; }): Promise<boolean> {
	if ( !(await Notes.isVisibleForMe(note, antenna.userId))) {
		return false;
	}
	
	const keywords = antenna.keywords
		// Clean up
		.map(xs => xs.filter(x => x !== ''))
		.filter(xs => xs.length > 0);

	if (keywords.length > 0) {
		if (note.text == null) return false;

		const matched = keywords.some(and =>
			and.every(keyword =>
				antenna.caseSensitive
					? note.text!.includes(keyword)
					: note.text!.toLowerCase().includes(keyword.toLowerCase())
			));

		if (!matched) return false;
	}

	const excludeKeywords = antenna.excludeKeywords
		// Clean up
		.map(xs => xs.filter(x => x !== ''))
		.filter(xs => xs.length > 0);

	if (excludeKeywords.length > 0) {
		if (note.text == null) return false;

		const matched = excludeKeywords.some(and =>
			and.every(keyword =>
				antenna.caseSensitive
					? note.text!.includes(keyword)
					: note.text!.toLowerCase().includes(keyword.toLowerCase())
			));

		if (matched) return false;
	}

	if (antenna.withFile) {
		if (note.fileIds && note.fileIds.length === 0) return false;
	}

	// TODO: eval expression

	return true;
}
