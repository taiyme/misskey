/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { miLocalStorage } from '@/local-storage.js';
import { lang, updateLocale, version } from '@/config.js';
import { type Locale, updateI18n } from '@/i18n.js';

export const checkUpdateLocale = async (
	opt?: {
		force?: boolean;
	},
): Promise<boolean> => {
	const localeVersion = miLocalStorage.getItem('localeVersion');
	const localeOutdated = opt?.force || (localeVersion == null || localeVersion !== version);
	if (!localeOutdated) return false;

	const res = await window.fetch(`/assets/locales/${lang}.${version}.json`, { cache: 'no-store' });
	if (res.status !== 200) return false;

	const newLocale = await res.text();
	const parsedNewLocale = JSON.parse(newLocale) as unknown as Locale;

	miLocalStorage.setItem('locale', newLocale);
	miLocalStorage.setItem('localeVersion', version);

	updateLocale(parsedNewLocale);
	updateI18n(parsedNewLocale);

	return true;
};
