/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { type Paging } from '@/components/MkPagination.vue';
import { api } from '@/os.js';
import { checkHttpOrHttps } from '@/scripts/tms/check-url.js';
import { checkMisskeyId } from '@/scripts/tms/check-misskey-id.js';

export type NotePickup = Misskey.entities.Note | null;
export type NotePagination = Paging<'notes/search'> | null;

export const searchNote = (props: {
	query: string;
	userId?: string | null;
	localOnly?: boolean | null;
}): {
	notePickup: Promise<NotePickup>;
	notePagination: NotePagination;
} => {
	const query = props.query.trim();
	const userId = props.userId ?? undefined;
	const host = props.localOnly ? '.' : undefined;
	const notePickup = pickupNote(query);
	const notePagination = {
		endpoint: 'notes/search' as const,
		limit: 10,
		params: { query, userId, host },
	};
	return { notePickup, notePagination };
};

const pickupNote = async (query: string): Promise<NotePickup> => {
	const fetchFromAp = async (q: string): Promise<NotePickup> => {
		const result = await api('ap/show', {
			uri: q,
		}).catch(() => null);
		return result?.type === 'Note' ? result.object : null;
	};
	const fetchFromNoteId = async (q: string): Promise<NotePickup> => {
		return api('notes/show', {
			noteId: q,
		}).catch(() => null);
	};
	if (checkHttpOrHttps(query)) {
		return fetchFromAp(query);
	}
	if (checkMisskeyId(query)) {
		return fetchFromNoteId(query);
	}
	return null;
};

export type UserPickup = Misskey.entities.UserDetailed | null;
export type UserPagination = Paging<'users/search'> | null;

export const searchUser = (props: {
	query: string;
	origin?: string | null;
}): {
	userPickup: Promise<UserPickup>;
	userPagination: UserPagination;
} => {
	const query = props.query.trim();
	const origin = props.origin ?? 'combined';
	const userPickup = pickupUser(query);
	const userPagination = {
		endpoint: 'users/search' as const,
		limit: 10,
		params: { query, origin },
	};
	return { userPickup, userPagination };
};

const pickupUser = async (query: string): Promise<UserPickup> => {
	const fetchFromAp = async (q: string): Promise<UserPickup> => {
		const result = await api('ap/show', {
			uri: q,
		}).catch(() => null);
		return result?.type === 'User' ? result.object : null;
	};
	const fetchFromUserId = async (q: string): Promise<UserPickup> => {
		return api('users/show', {
			userId: q,
		}).catch(() => null);
	};
	const fetchFromUsername = async (q: string): Promise<UserPickup> => {
		const { username, host } = Misskey.acct.parse(q);
		if (!username) return null;
		return api('users/show', {
			username,
			host: host ?? undefined,
		}).catch(() => null);
	};
	if (checkHttpOrHttps(query)) {
		return fetchFromAp(query);
	}
	if (checkMisskeyId(query)) {
		return fetchFromUserId(query).then(x => x ?? fetchFromUsername(query));
	}
	return fetchFromUsername(query);
};
