/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { inject, provide } from 'vue';

type Ui = (
	| 'universal'
	| 'deck'
	| 'classic'
	| 'visitor'
	| 'zen'
	| 'minimum'
);

const UI_PROVIDE_KEY = Symbol('UiProvideKey');

export const provideUi = (ui: Ui): void => {
	provide(UI_PROVIDE_KEY, ui);
};

export const injectUi = (): Ui | undefined => {
	return inject<Ui>(UI_PROVIDE_KEY);
};
