/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module '@/themes/*.json5' {
	import type { Theme } from '@/scripts/theme.js';

	const theme: Theme;

	export default theme;
}
