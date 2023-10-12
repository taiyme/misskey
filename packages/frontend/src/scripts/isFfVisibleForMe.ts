/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { $i } from '@/account.js';

export function isFfVisibleForMe(user: Misskey.entities.UserDetailed): boolean {
	if ($i && $i.id === user.id) return true;

	if (user.ffVisibility === 'private') return false;
	if (user.ffVisibility === 'followers' && !user.isFollowing) return false;

	return true;
}
