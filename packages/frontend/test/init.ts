/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';
// @ts-expect-error https://github.com/IanVS/vitest-fetch-mock/issues/10
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

// Set i18n
import locales from '../../../locales/index.js';
import { updateI18n } from '@/i18n.js';
updateI18n(locales['en-US']);

// XXX: misskey-js panics if WebSocket is not defined
vi.stubGlobal('WebSocket', class WebSocket extends EventTarget { static CLOSING = 2; });

// XXX: defaultStore somehow becomes undefined in vitest?
vi.mock('@/store.js', () => {
	return {
		defaultStore: {
			state: {},
		},
	};
});
