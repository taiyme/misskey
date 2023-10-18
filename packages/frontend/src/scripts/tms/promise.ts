/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Promiseの評価を遅延させる
 * @param prom 遅延させるPromise
 * @param delay 遅延する時間(ミリ秒)
 * @returns 履行または拒否されたPromise
 */
export const delayedPromise = <T>(prom: PromiseLike<T>, delay: number): Promise<T> => {
	return new Promise((resolve, reject) => {
		window.setTimeout(() => {
			prom.then(
				value => resolve(Promise.resolve(value)),
				reason => reject(Promise.reject(reason)),
			);
		}, delay);
	});
};

export const sleep = (ms: number): Promise<void> => new Promise(r => window.setTimeout(r, ms));

/**
 * Promise内の型を取り出す
 */
export type ExtractPromiseType<T extends PromiseLike<unknown>> = T extends PromiseLike<infer P> ? P : never;
