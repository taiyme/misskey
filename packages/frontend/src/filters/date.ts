/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { dateTimeFormat } from '@@/js/intl-const.js';

// eslint-disable-next-line import/no-default-export
export default (d: Date | number | undefined) => dateTimeFormat.format(d);
export const dateString = (d: string) => dateTimeFormat.format(new Date(d));
