/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Config } from '@/config.js';

export const comment = `<!--
    _     _
  _| |,__|_|_ _ _____ ___
 |_  |__ | | | |     | | |
   | | | | |_, | | | | __|
   |_|__/|_|__/|_|_|_|___|
 Thank you for using taiyme!
 If you are reading this message... how about joining the development?
 https://github.com/taiyme/misskey

-->`;

export const defaultDescription = '✨🌎✨ A interplanetary communication platform ✨🚀✨';

export type MinimumCommonData = {
	version: string;
	config: Config;
};

export type CommonData = MinimumCommonData & {
	langs: string[];
	instanceName: string;
	icon: string | null;
	appleTouchIcon: string | null;
	themeColor: string | null;
	serverErrorImageUrl: string;
	infoImageUrl: string;
	notFoundImageUrl: string;
	instanceUrl: string;
	now: number;
	federationEnabled: boolean;
	frontendBootloaderJs: string | null;
	frontendBootloaderCss: string | null;
	frontendEmbedBootloaderJs: string | null;
	frontendEmbedBootloaderCss: string | null;
	metaJson?: string;
	clientCtxJson?: string;
};

export type CommonPropsMinimum<T = Record<string, any>> = MinimumCommonData & T;

export type CommonProps<T = Record<string, any>> = CommonData & T;
