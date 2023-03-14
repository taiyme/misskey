import { Note } from 'misskey-js/built/entities';
import * as os from '@/os';
import { tmsStore } from '@/tms/store';
import { i18n } from '@/i18n';
import { getNoteSummary } from '@/scripts/get-note-summary';

const checkImanonashi = (note: Note): boolean => {
	const { text, cw, fileIds, renoteId, replyId, poll } = note;
	if (!text || cw != null || fileIds.length || renoteId || replyId || poll) return false;

	const words = tmsStore.state.imanonashiWords;
	if (words.length === 0) return false;

	return words.some(filter => {
		if (Array.isArray(filter)) {
			// Clean up
			const filteredFilter = filter.filter(keyword => keyword !== '');
			if (filteredFilter.length === 0) return false;

			return filteredFilter.every(keyword => text.includes(keyword));
		} else {
			// represents RegExp
			const regexp = filter.match(/^\/(.+)\/(.*)$/);

			// This should never happen due to input sanitisation.
			if (!regexp) return false;

			try {
				const [, pattern, flags] = regexp;
				return new RegExp(pattern, flags).test(text);
			} catch (err) {
				// This should never happen due to input sanitisation.
				return false;
			}
		}
	});
};

const fetchPrevNote = async ({ id: untilId, userId }: Note): Promise<Note | null> => {
	return await os.api('users/notes', { userId, untilId, limit: 1 }).then(notes => notes[0] ?? null).catch(() => null);
};

const deleteNotes = async ([...notes]: Note[]): Promise<void> => {
	const sleep = (ms: number): Promise<void> => new Promise(r => window.setTimeout(r, ms));

	notes.reduce((prom, { id: noteId }, i) => prom.then(async () => {
		if (i) await sleep(2000);
		await os.api('notes/delete', { noteId });
	}), Promise.resolve());
};

export const imanonashi = async (note: Note): Promise<void> => {
	if (!tmsStore.state.useImanonashi) return;
	if (!checkImanonashi(note)) return;

	const prev = await fetchPrevNote(note);
	if (!prev) {
		os.alert({
			type: 'error',
			text: i18n.ts.noNotes,
		});
		return;
	}

	const notes = tmsStore.state.imanonashiItself ? [note, prev] : [prev];
	const flag = tmsStore.state.imanonashiConfirm
		? await os.confirm({
			type: 'warning',
			text: `${i18n.ts.noteDeleteConfirm}\n\n${notes.map(getNoteSummary).map(sum => sum.replace(/^/gm, '> ')).join('\n\n')}`,
			allowMfm: true,
		}).then(({ canceled }) => !canceled)
		: true;

	if (!flag) return;

	deleteNotes([...notes].reverse());
};
