/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw } from 'vue';
import { locale } from '@/config.js';
import { I18n } from '@/scripts/i18n.js';
import type { Locale } from '@/../../locales/index.js';
export type { Locale };

// @ts-expect-error Locale型と実装がズレてしまうが...
export const i18n = markRaw(new I18n<Locale>(locale ?? {}));

export const updateI18n = (newLocale: Locale): void => {
	i18n.ts = newLocale;
};
