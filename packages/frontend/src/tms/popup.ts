/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type BundledLanguage as ShikiLangs } from 'shiki';
import { popup } from '@/os.js';
import TmsCodePreviewDialog from '@/components/TmsCodePreviewDialog.vue';

type CodePreviewProps = {
	name: string;
	lang?: ShikiLangs | 'aiscript';
	code: string;
};
export const codePreview = async (props: CodePreviewProps): Promise<void> => {
	return new Promise(async (resolve) => {
		popup(TmsCodePreviewDialog, props, {
			done: () => {
				resolve();
			},
		}, 'closed');
	});
};
