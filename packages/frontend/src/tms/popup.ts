/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BundledLanguage } from 'shiki/langs';
import { popup } from '@/os.js';
import TmsCodePreviewDialog from '@/components/TmsCodePreviewDialog.vue';

type CodePreviewProps = {
	name: string;
	lang?: BundledLanguage | 'aiscript';
	code: string;
};

export const codePreview = (props: CodePreviewProps): Promise<void> => {
	return new Promise((resolve) => {
		const { dispose } = popup(TmsCodePreviewDialog, props, {
			done: () => {
				resolve();
			},
			closed: () => dispose(),
		});
	});
};
