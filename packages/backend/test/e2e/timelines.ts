/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import * as assert from 'node:assert';

describe('Timelines', () => {
	// TODO: 今後タイムラインのテストを追加する

	test('テストは必ず成功する', () => {
		assert.strictEqual(1, 1);
	});
});
