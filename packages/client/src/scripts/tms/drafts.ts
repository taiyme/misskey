import * as Misskey from 'misskey-js';
import { defaultStore } from '@/store';
import { parseObject } from '@/scripts/tms/parse';

const LS_DRAFTS_KEY = 'tmsDrafts';
const LS_MESSAGE_DRAFTS_KEY = 'tmsMessageDrafts';

type DraftData = {
	text: string;
	useCw: boolean;
	cw: string | null;
	visibility: Misskey.entities.Note['visibility'];
	localOnly: boolean;
	files: Misskey.entities.DriveFile[];
	poll: {
		choices: string[];
		multiple: boolean;
		expiresAt: string | null;
		expiredAfter: string | null;
	} | null;
};

type LsDraft = {
	updatedAt: string;
	data: Partial<DraftData>;
};

type Draft = {
	updatedAt: string;
	data: DraftData;
};

type MessageDraftData = {
	text: string;
	file: Misskey.entities.DriveFile | null;
};

type LsMessageDraft = {
	updatedAt: string;
	data: Partial<MessageDraftData>;
};

type MessageDraft = {
	updatedAt: string;
	data: MessageDraftData;
};

const isEmptyObject = (obj: Record<string, unknown>): obj is Record<string, never> => !Object.values(obj).some(v => v !== undefined);

const getVisibility = (): Misskey.entities.Note['visibility'] => defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility;
const getLocalOnly = (): boolean => defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly;

const loadLsDrafts = (): Record<string, LsDraft | undefined> => parseObject<Record<string, LsDraft | undefined>>(localStorage.getItem(LS_DRAFTS_KEY));
const saveLsDrafts = (drafts: Record<string, LsDraft | undefined>): void => localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));

export const getDraft = (draftKey: string | null): Draft | null => {
	if (!draftKey) return null;

	const draft = loadLsDrafts()[draftKey];
	if (!draft) return null;

	const { updatedAt, data: { text, useCw, cw, visibility, localOnly, files, poll } } = draft;

	return {
		updatedAt,
		data: {
			text: text ?? '',
			useCw: useCw ?? false,
			cw: cw ?? (useCw ? '' : null),
			visibility: visibility ?? getVisibility(),
			localOnly: localOnly ?? getLocalOnly(),
			files: files ?? [],
			poll: poll ?? null,
		},
	};
};

export const setDraft = (draftKey: string | null, data: DraftData): void => {
	if (!draftKey) return;

	const drafts = loadLsDrafts();

	const { text, useCw, cw, visibility, localOnly, files, poll } = data;

	const draftData: LsDraft['data'] = {
		text: text || undefined,
		useCw: useCw || undefined,
		cw: cw || undefined,
		visibility: visibility !== getVisibility() ? visibility : undefined,
		localOnly: localOnly !== getLocalOnly() ? localOnly : undefined,
		files: files.length ? files : undefined,
		poll: poll ?? undefined,
	};

	if (isEmptyObject(draftData)) return deleteDraft(draftKey);

	saveLsDrafts({
		...drafts,
		[draftKey]: {
			updatedAt: new Date().toJSON(),
			data: draftData,
		},
	});
};

export const deleteDraft = (draftKey: string | null): void => {
	if (!draftKey) return;

	const drafts = loadLsDrafts();

	delete drafts[draftKey];

	saveLsDrafts(drafts);
};

const loadLsMessageDrafts = (): Record<string, LsMessageDraft | undefined> => parseObject<Record<string, LsMessageDraft | undefined>>(localStorage.getItem(LS_MESSAGE_DRAFTS_KEY));
const saveLsMessageDrafts = (drafts: Record<string, LsMessageDraft | undefined>): void => localStorage.setItem(LS_MESSAGE_DRAFTS_KEY, JSON.stringify(drafts));

export const getMessageDraft = (draftKey: string | null): MessageDraft | null => {
	if (!draftKey) return null;

	const draft = loadLsMessageDrafts()[draftKey];
	if (!draft) return null;

	const { updatedAt, data: { text, file } } = draft;

	return {
		updatedAt,
		data: {
			text: text ?? '',
			file: file ?? null,
		},
	};
};

export const setMessageDraft = (draftKey: string | null, data: MessageDraftData): void => {
	if (!draftKey) return;

	const drafts = loadLsMessageDrafts();

	const { text, file } = data;

	const draftData: LsMessageDraft['data'] = {
		text: text || undefined,
		file: file ?? undefined,
	};

	if (isEmptyObject(draftData)) return deleteMessageDraft(draftKey);

	saveLsMessageDrafts({
		...drafts,
		[draftKey]: {
			updatedAt: new Date().toJSON(),
			data: draftData,
		},
	});
};

export const deleteMessageDraft = (draftKey: string | null): void => {
	if (!draftKey) return;

	const drafts = loadLsMessageDrafts();

	delete drafts[draftKey];

	saveLsMessageDrafts(drafts);
};
