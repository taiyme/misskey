/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const filterKeyboardNonComposing = (listener: ((ev: KeyboardEvent) => unknown)) => {
	return (ev: KeyboardEvent) => {
		if (!isKeyboardNonComposing(ev)) return;
		listener(ev);
	};
};

const isKeyboardNonComposing = (ev: KeyboardEvent) => {
	return !(ev.isComposing || ev.keyCode === 229 || ev.key === 'Process' || ev.key === 'Unidentified');
};

export const filterKeyboardEnterOrSpace = (listener: ((ev: KeyboardEvent) => unknown)) => {
	return (ev: KeyboardEvent) => {
		if (!isKeyboardNonComposing(ev)) return;
		if (!isKeyboardEnterOrSpace(ev)) return;
		ev.preventDefault();
		ev.stopPropagation();
		if (ev.repeat) return;
		listener(ev);
	};
};

const isKeyboardEnterOrSpace = (ev: KeyboardEvent) => {
	return ev.key === 'Enter' || ev.key === ' ';
};
