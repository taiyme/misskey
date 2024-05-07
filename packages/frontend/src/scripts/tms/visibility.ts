/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';

type Visibility = (typeof Misskey.noteVisibilities)[number];

export const smallerVisibility = (list: Visibility[]): Visibility => {
	if (list.includes('specified')) return 'specified' as const;
	if (list.includes('followers')) return 'followers' as const;
	if (list.includes('home')) return 'home' as const;
	return 'public' as const;
};
