/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { i18n } from '@/i18n.js';
import { alert, confirm, toast } from '@/os.js';
import { tmsStore } from '@/tms/store.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { TmsError, parseErrorMessage } from '@/scripts/tms/error.js';
import { isQuote, isRenote } from '@/scripts/tms/is-renote.js';

const errors = {
	noSuchPreviousNote: {
		message: 'No such previous note.',
		code: 'NO_SUCH_PREVIOUS_NOTE',
		id: '62698682-7a6f-4e4d-bf39-7e4bfe1c9f46',
		kind: 'imanonashi',
	},
	processingCanceled: {
		message: 'Processing canceled.',
		code: 'PROCESSING_CANCELED',
		id: '76c24793-c0c6-4bf5-a165-687a54da2eef',
		kind: 'imanonashi',
	},
	failedToDeleteNote: {
		message: 'Failed to delete note.',
		code: 'FAILED_TO_DELETE_NOTE',
		id: 'f678b121-e4b2-442b-a61f-5bdebbd749b8',
		kind: 'imanonashi',
	},
} as const;

type NoteEntity = Misskey.entities.Note;

type MeEntity = {
	readonly meId: string;
	readonly token: string | undefined;
};

const IMANONASHI_WORD = 'いまのなし' as const;

export const imanonashi = async (note: NoteEntity, me: MeEntity): Promise<void> => {
	if (!tmsStore.state.enableImanonashi) return;
	if (!checkImanonashi(note, me)) return;

	deletePreviousNote(note, me).then(() => {
		toast(i18n.ts._tms.imanonashiSucceeded);
	}).catch(err => {
		if (err instanceof TmsError) {
			if (err.id === errors.processingCanceled.id) { // PROCESSING_CANCELED
				return;
			}
		}
		alert({
			type: 'error',
			title: i18n.ts._tms.imanonashiFailed,
			text: parseErrorMessage(err),
		});
	});;
};

const checkImanonashi = (note: NoteEntity, me: MeEntity): boolean => {
	if (note.userId !== me.meId) return false;
	if (note.replyId != null) return false;
	if (note.renoteId != null) return false;
	if (note.cw != null) return false;
	if (note.fileIds != null && note.fileIds.length !== 0) return false;
	if (note.poll != null) return false;
	return note.text === IMANONASHI_WORD;
};

const fetchPreviousNote = async (note: NoteEntity, me: MeEntity): Promise<NoteEntity> => {
	const latestNotes = await misskeyApi('users/notes', {
		userId: me.meId,
		limit: 10,
		untilId: note.id,
	}, me.token).catch(() => []);
	for (const latestNote of latestNotes) {
		if (note.userId !== me.meId) continue;
		if (isRenote(latestNote) && !isQuote(latestNote)) continue;
		if (checkImanonashi(latestNote, me)) continue;
		return latestNote;
	}
	throw new TmsError(errors.noSuchPreviousNote);
};

const deleteNote = (note: NoteEntity, me: MeEntity): Promise<{
	readonly status: 'success';
} | {
	readonly status: 'failure';
	readonly error: (typeof errors)[keyof (typeof errors)];
}> => {
	return new Promise(resolve => {
		const success = (): void => {
			resolve({ status: 'success' });
		};
		const failure = (): void => {
			resolve({
				status: 'failure',
				error: errors.failedToDeleteNote,
			});
		};
		let retry = 3;
		const handler = (): void => {
			if (retry > 0) {
				retry--;
				misskeyApi('notes/delete', { noteId: note.id }, me.token).then(() => {
					success();
				}).catch(err => {
					if (err.id === '490be23f-8c1f-4796-819f-94cb4f9d1630') { // NO_SUCH_NOTE
						success();
					} else if (err.id === 'd5826d14-3982-4d2e-8011-b9e9f02499ef') { // RATE_LIMIT_EXCEEDED
						window.setTimeout(handler, 5000);
					} else {
						failure();
					}
				});
			} else {
				failure();
			}
		};
		window.setTimeout(handler, 3000);
	});
};

const deletePreviousNote = async (note: NoteEntity, me: MeEntity): Promise<void> => {
	const previousNote = await fetchPreviousNote(note, me);
	if (tmsStore.state.enableImanonashiConfirm) {
		const { canceled } = await confirm({
			type: 'warning',
			text: i18n.ts.noteDeleteConfirm,
			note: previousNote,
		});
		if (canceled) {
			throw new TmsError(errors.processingCanceled);
		}
	}
	const result = await deleteNote(previousNote, me);
	if (result.status === 'failure') {
		throw new TmsError(result.error);
	}
};
