/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { $i } from '@/account.js';

const providedContextEl = document.getElementById('misskey_clientCtx');

export type ServerContext = {
	clip?: Misskey.entities.Clip;
	note?: Misskey.entities.Note;
	user?: Misskey.entities.UserDetailed;
} | null;

export const serverContext: ServerContext = (providedContextEl && providedContextEl.textContent) ? JSON.parse(providedContextEl.textContent) : null;

export function getServerContext<
	K extends keyof NonNullable<ServerContext>,
	R = Required<NonNullable<ServerContext>>[K] | null,
>(entity: K) {
	// contextは非ログイン状態の情報しかないためログイン時は利用できない
	if ($i) return null as R;

	return (serverContext?.[entity] ?? null) as R;
}
