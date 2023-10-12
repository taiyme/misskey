/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { dateTimeFormat } from '@/scripts/intl-const.js';

export default (d: Date | number | undefined) => dateTimeFormat.format(d);
export const dateString = (d: string) => dateTimeFormat.format(new Date(d));
