import * as Misskey from 'misskey-js';
import { defaultStore } from '@/store';
import { parseObject } from '@/scripts/tms/parse';
import { EditedPoll } from '@/components/MkPollEditor.vue';

const LS_DRAFTS_KEY = 'tmsDrafts';
const LS_MESSAGE_DRAFTS_KEY = 'tmsMessageDrafts';

type DraftData = {
	text: string;
	useCw: boolean;
	cw: string;
	visibility: Misskey.entities.Note['visibility'];
	localOnly: boolean;
	files: Misskey.entities.DriveFile[];
	poll: EditedPoll | null;
	replyId: string | null;
	renoteId: string | null;
	channelId: string | null;
};

type LsDraft = {
	updatedAt: string;
	data: Partial<DraftData>;
};

export type Draft = {
	updatedAt: string;
	data: DraftData;
};

export type DraftWithId = Draft & {
	id: string;
};

type MessageDraftData = {
	text: string;
	file: Misskey.entities.DriveFile | null;
};

type LsMessageDraft = {
	updatedAt: string;
	data: Partial<MessageDraftData>;
};

export type MessageDraft = {
	updatedAt: string;
	data: MessageDraftData;
};

export type MessageDraftWithId = MessageDraft & {
	id: string;
};

const isEmptyObject = <T extends Record<string, unknown>>(obj: T, ignoreKeys?: (keyof T)[]): obj is Record<keyof T, never> => {
	return !Object.entries(obj).some(([k, v]) => !(ignoreKeys ?? []).includes(k) && typeof v !== 'undefined');
};

export const getVisibility = (): Misskey.entities.Note['visibility'] => defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility;
export const getLocalOnly = (): boolean => defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly;

const loadLsDrafts = (): Record<string, LsDraft | undefined> => parseObject<Record<string, LsDraft | undefined>>(localStorage.getItem(LS_DRAFTS_KEY));
const saveLsDrafts = (drafts: Record<string, LsDraft | undefined>): void => localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));

const restoreDraftData = (lsDraft: Partial<DraftData>): DraftData => {
	const { text, useCw, cw, visibility, localOnly, files, poll, replyId, renoteId, channelId } = lsDraft;

	const draftData: DraftData = {
		text: text ?? '',
		useCw: useCw ?? false,
		cw: cw ?? '',
		visibility: visibility ?? getVisibility(),
		localOnly: localOnly ?? getLocalOnly(),
		files: files ?? [],
		poll: poll ?? null,
		replyId: replyId ?? null,
		renoteId: renoteId ?? null,
		channelId: channelId ?? null,
	};

	if (draftData.channelId) {
		draftData.localOnly = true;
	}

	return draftData;
};

export const getAllDraft = (): DraftWithId[] => {
	const drafts = loadLsDrafts();

	return Object.entries(drafts).flatMap(([id, draft]) => {
		if (!draft) return [];
		const { updatedAt, data } = draft;
		return [{
			id,
			updatedAt,
			data: restoreDraftData(data),
		}];
	});
};

export const getDraft = (draftKey: string | null): Draft | null => {
	if (!draftKey) return null;

	const draft = loadLsDrafts()[draftKey];
	if (!draft) return null;

	const { updatedAt, data } = draft;

	return {
		updatedAt,
		data: restoreDraftData(data),
	};
};

export const setDraft = (draftKey: string | null, data: DraftData): void => {
	if (!draftKey) return;

	const drafts = loadLsDrafts();

	const { text, useCw, cw, visibility, localOnly, files, poll, replyId, renoteId, channelId } = data;

	const draftData: LsDraft['data'] = {
		text: text || undefined,
		useCw: useCw || undefined,
		cw: cw || undefined,
		visibility: visibility !== getVisibility() ? visibility : undefined,
		localOnly: localOnly !== getLocalOnly() ? localOnly : undefined,
		files: files.length ? files : undefined,
		poll: poll ?? undefined,
		replyId: replyId ?? undefined,
		renoteId: renoteId ?? undefined,
		channelId: channelId ?? undefined,
	};

	if (draftData.channelId) {
		draftData.localOnly = undefined;
	}

	if (isEmptyObject(draftData, ['replyId', 'renoteId', 'channelId'])) return deleteDraft(draftKey);

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

const restoreMessageDraftData = (lsDraft: Partial<MessageDraftData>): MessageDraftData => {
	const { text, file } = lsDraft;

	const draftData: MessageDraftData = {
		text: text ?? '',
		file: file ?? null,
	};

	return draftData;
};

export const getAllMessageDraft = (): MessageDraftWithId[] => {
	const drafts = loadLsMessageDrafts();

	return Object.entries(drafts).flatMap(([id, draft]) => {
		if (!draft) return [];
		const { updatedAt, data } = draft;
		return [{
			id,
			updatedAt,
			data: restoreMessageDraftData(data),
		}];
	});
};

export const getMessageDraft = (draftKey: string | null): MessageDraft | null => {
	if (!draftKey) return null;

	const draft = loadLsMessageDrafts()[draftKey];
	if (!draft) return null;

	const { updatedAt, data } = draft;

	return {
		updatedAt,
		data: restoreMessageDraftData(data),
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

	if (isEmptyObject(draftData, [])) return deleteMessageDraft(draftKey);

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
