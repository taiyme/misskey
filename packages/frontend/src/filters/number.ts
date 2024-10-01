/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { numberFormat } from '@@/js/intl-const.js';

// eslint-disable-next-line import/no-default-export
export default n => n == null ? 'N/A' : numberFormat.format(n);
