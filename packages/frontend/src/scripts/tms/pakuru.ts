/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { NoteEntityOrId, toParameters } from '@/scripts/tms/to-parameters.js';

export const pakuru = async (noteEntityOrId: NoteEntityOrId, fromId?: string | null): Promise<Misskey.Endpoints['notes/create']['res']> => {
	const { parameters, me } = await toParameters(noteEntityOrId, fromId);
	return misskeyApi('notes/create', parameters, me.token);
};
