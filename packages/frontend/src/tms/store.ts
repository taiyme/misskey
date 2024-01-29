/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw } from 'vue';
import { Storage } from '@/pizzax.js';

/**
 * tmsStore -- 独自実装した機能についてのデータを格納する
 */
export const tmsStore = markRaw(new Storage('tmsMain', {
}));
