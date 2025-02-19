/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const CUSTOM_CSS_PREVIEW_PARAM_KEY = 'customcsspreview';

const serverStyleTag = document.createElement('style');
const userStyleTag = document.createElement('style');

serverStyleTag.id = 'server_custom_css';
userStyleTag.id = 'user_custom_css';

document.head.appendChild(serverStyleTag);
document.head.appendChild(userStyleTag);

export let customCssPreviewId: string | null = null;
export let customCssPreviewData: string | null = null;

export function applyServerCustomCss(css: string | null) {
	if (customCssPreviewId != null) return;

	serverStyleTag.textContent = css ?? '';
}

export function applyUserCustomCss(css: string | null) {
	if (customCssPreviewId != null) return;

	userStyleTag.textContent = css ?? '';
}

export function previewServerCustomCss(id: string) {
	if (customCssPreviewId != null) return;

	const css = window.sessionStorage.getItem(id);
	if (css == null) return;

	customCssPreviewId = id;
	customCssPreviewData = css;
	serverStyleTag.textContent = css;
}

export function previewUserCustomCss(id: string) {
	if (customCssPreviewId != null) return;

	const css = window.sessionStorage.getItem(id);
	if (css == null) return;

	customCssPreviewId = id;
	customCssPreviewData = css;
	userStyleTag.textContent = css;
}
