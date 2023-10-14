/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * 文字列の先頭に 'v' が含まれていたら取り除く
 */
export const trimV = (v: string): string => v.startsWith('v') ? v.slice(1) : v;

/**
 * 文字列の先頭に 'v' が含まれていなければ付け加える
 */
export const withV = (v: string): string => v.startsWith('v') ? v : `v${v}`;
