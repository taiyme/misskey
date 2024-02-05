/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithNonNullable<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };
