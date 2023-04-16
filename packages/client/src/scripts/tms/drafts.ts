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
	quoteId: string | null;
};

type LsDraft = {
	updatedAt: string;
	data: Partial<DraftData>;
};

export type Draft = {
	id: string;
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

export type MessageDraft = {
	id: string;
	updatedAt: string;
	data: MessageDraftData;
};

type PartialNullable<T> = {
	[P in keyof T]?: T[P] | null;
};

export const genDraftId = (data: PartialNullable<{
	user: {
		id: string;
	};
	reply: Misskey.entities.Note;
	renote: Misskey.entities.Note;
	channel: Misskey.entities.Channel;
	isEdit: boolean;
}>): Draft['id'] | null => {
	const entries: [string, string | null][] = [];
	const { user, reply, renote, channel, isEdit } = data;

	if (!user) return null;
	entries.push(['u', user.id]);

	if (channel) {
		entries.push(['ch', channel.id]);
	}
	if (renote) {
		entries.push(['rn', renote.id]);
	} else if (reply) {
		entries.push(['re', reply.id]);
	} else {
		if (isEdit) {
			entries.push(['edit', Date.now().toString()]);
		} else {
			entries.push(['new', null]);
		}
	}

	return entries.map(([k, v]) => v ? `${k}:${v}` : k).join('/');
};

export const parseDraftId = (draftId: Draft['id'] | null): {
	userId: string | null;
	replyId: string | null;
	renoteId: string | null;
	channelId: string | null;
	isNew: boolean;
	isEdit: boolean;
} => {
	const result: ReturnType<typeof parseDraftId> = {
		userId: null,
		replyId: null,
		renoteId: null,
		channelId: null,
		isNew: false,
		isEdit: false,
	};

	const entries = draftId ? draftId.split('/').map<[string, string | null]>(kv => {
		const [k, v = null] = kv.split(':');
		return [k, v];
	}) : [];

	entries.forEach(([k, v]) => {
		if (k === 'u') result.userId = v;
		if (k === 're') result.replyId = v;
		if (k === 'rn') result.renoteId = v;
		if (k === 'ch') result.channelId = v;
		if (k === 'new') result.isNew = true;
		if (k === 'edit') result.isEdit = true;
	});

	return result;
};

const isEmptyObject = <T extends Record<string, unknown>>(obj: T, ignoreKeys?: (keyof T)[]): obj is Record<keyof T, never> => {
	return !Object.entries(obj).some(([k, v]) => !(ignoreKeys ?? []).includes(k) && typeof v !== 'undefined');
};

export const getVisibility = (): Misskey.entities.Note['visibility'] => defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility;
export const getLocalOnly = (): boolean => defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly;

const loadLsDrafts = (): Record<string, LsDraft | undefined> => parseObject<Record<string, LsDraft | undefined>>(localStorage.getItem(LS_DRAFTS_KEY));
const saveLsDrafts = (drafts: Record<string, LsDraft | undefined>): void => localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));

const restoreDraftData = (lsDraft: Partial<DraftData>): DraftData => {
	const { text, useCw, cw, visibility, localOnly, files, poll, replyId, renoteId, channelId, quoteId } = lsDraft;

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
		quoteId: quoteId ?? null,
	};

	if (draftData.channelId) {
		draftData.localOnly = true;
	}

	return draftData;
};

export const getAllDraft = (): Draft[] => {
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
		id: draftKey,
		updatedAt,
		data: restoreDraftData(data),
	};
};

export const setDraft = (draftKey: string | null, data: DraftData): Draft | null => {
	if (!draftKey) return null;

	const drafts = loadLsDrafts();

	const { text, useCw, cw, visibility, localOnly, files, poll, replyId, renoteId, channelId, quoteId } = data;

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
		quoteId: quoteId ?? undefined,
	};

	if (draftData.channelId) {
		draftData.localOnly = undefined;
	}

	if (isEmptyObject(draftData, ['replyId', 'renoteId', 'channelId', 'visibility', 'localOnly'])) {
		deleteDraft(draftKey);
		return null;
	}

	const updatedAt = new Date().toJSON();

	saveLsDrafts({
		...drafts,
		[draftKey]: {
			updatedAt,
			data: draftData,
		},
	});

	return {
		id: draftKey,
		updatedAt,
		data: restoreDraftData(draftData),
	};
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

export const getAllMessageDraft = (): MessageDraft[] => {
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
		id: draftKey,
		updatedAt,
		data: restoreMessageDraftData(data),
	};
};

export const setMessageDraft = (draftKey: string | null, data: MessageDraftData): MessageDraft | null => {
	if (!draftKey) return null;

	const drafts = loadLsMessageDrafts();

	const { text, file } = data;

	const draftData: LsMessageDraft['data'] = {
		text: text || undefined,
		file: file ?? undefined,
	};

	if (isEmptyObject(draftData, [])) {
		deleteMessageDraft(draftKey);
		return null;
	}

	const updatedAt = new Date().toJSON();

	saveLsMessageDrafts({
		...drafts,
		[draftKey]: {
			updatedAt,
			data: draftData,
		},
	});

	return {
		id: draftKey,
		updatedAt,
		data: restoreMessageDraftData(draftData),
	};
};

export const deleteMessageDraft = (draftKey: string | null): void => {
	if (!draftKey) return;

	const drafts = loadLsMessageDrafts();

	delete drafts[draftKey];

	saveLsMessageDrafts(drafts);
};
