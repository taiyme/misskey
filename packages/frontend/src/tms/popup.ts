/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BUNDLED_LANGUAGES, type Lang as ShikiLangs } from 'shiki';
import { popup } from '@/os.js';
import TmsCodePreviewDialog from '@/components/TmsCodePreviewDialog.vue';
import { getHighlighter } from '@/scripts/code-highlighter.js';

type CodePreviewProps = {
	lang?: ShikiLangs | 'aiscript';
	code: string;
};
export const codePreview = async (props: CodePreviewProps): Promise<void> => {
	return new Promise(async (resolve) => {
		const highlighter = await getHighlighter();
		let codeLang: CodePreviewProps['lang'] = undefined;
		if (props.lang && !highlighter.getLoadedLanguages().includes(props.lang as ShikiLangs)) {
			const bundles = BUNDLED_LANGUAGES.filter((lang) => lang.id === props.lang || lang.aliases?.includes(props.lang as ShikiLangs));
			if (bundles.length > 0) {
				await highlighter.loadLanguage(props.lang as ShikiLangs);
				codeLang = props.lang;
			}
		} else {
			codeLang = props.lang;
		}
		const html = highlighter.codeToHtml(props.code, {
			lang: codeLang,
		});

		popup(TmsCodePreviewDialog, { html }, {
			done: () => {
				resolve();
			},
		}, 'closed');
	});
};
