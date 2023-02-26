import RE2 from 're2';
import { Note } from '@/models/entities/note.js';
import { User } from '@/models/entities/user.js';

type NoteLike = {
	userId: Note['userId'];
	cw: Note['cw'];
	text: Note['text'];
	reply: NoteLike | null;
	renote: NoteLike | null;
};

type UserLike = {
	id: User['id'];
};

// ワードミュート (ハード)
export async function checkWordMute(note: NoteLike, me: UserLike | null | undefined, mutedWords: Array<string | string[]>): Promise<boolean> {
	// 自分自身
	if (me && (note.userId === me.id)) return false;

	if (mutedWords.length > 0) {
		const text = [
			// 自分自身を除く返信
			...(note.reply && note.reply.userId !== me?.id) ? [
				note.reply?.cw ?? '',
				note.reply?.text ?? '',
			] : [],
			// 自分自身を除く投稿
			note.cw ?? '',
			note.text ?? '',
			// 自分自身を除くRN
			...(note.renote && note.renote.userId !== me?.id) ? [
				note.renote?.cw ?? '',
				note.renote?.text ?? '',
			] : [],
		].filter(x => x).join('\n').trim();

		if (text === '') return false;

		const matched = mutedWords.some(filter => {
			if (Array.isArray(filter)) {
				return filter.every(keyword => text.includes(keyword));
			} else {
				// represents RegExp
				const regexp = filter.match(/^\/(.+)\/(.*)$/);

				// This should never happen due to input sanitisation.
				if (!regexp) return false;

				try {
					return new RE2(regexp[1], regexp[2]).test(text);
				} catch (err) {
					// This should never happen due to input sanitisation.
					return false;
				}
			}
		});

		if (matched) return true;
	}

	return false;
}
