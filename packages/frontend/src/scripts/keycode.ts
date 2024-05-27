/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default (input: string): string[] => {
	if (Object.keys(aliases).some(a => a.toLowerCase() === input.toLowerCase())) {
		const codes = aliases[input];
		return Array.isArray(codes) ? codes : [codes];
	} else {
		return [input];
	}
};

// https://developer.mozilla.org/ja/docs/Web/API/UI_Events/Keyboard_event_key_values
export const aliases = {
	'esc': 'Escape',
	'enter': 'Enter',
	'space': ' ',
	'up': 'ArrowUp',
	'down': 'ArrowDown',
	'left': 'ArrowLeft',
	'right': 'ArrowRight',
	'plus': ['+', ';'],
};
