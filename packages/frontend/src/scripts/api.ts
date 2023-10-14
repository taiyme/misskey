/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';
import { ref } from 'vue';
import { apiUrl } from '@/config.js';
import { $i } from '@/account.js';
import { checkHttpOrHttps } from '@/scripts/tms/check-url.js';

type IsNeverType<T> = [T] extends [never] ? true : false;
type StrictExtract<Union, Cond> = Cond extends Union ? Union : never;
type IsCaseMatched<
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
	C extends number,
> = IsNeverType<StrictExtract<Misskey.Endpoints[E]['res']['$switch']['$cases'][C], [P, any]>> extends false ? true : false;
type GetCaseResult<
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
	C extends number,
> = StrictExtract<Misskey.Endpoints[E]['res']['$switch']['$cases'][C], [P, any]>[1];

type APIResultType<
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
> = (
	Misskey.Endpoints[E]['res'] extends {
		$switch: {
			$cases: [any, any][];
			$default: any;
		};
	} ? (
			IsCaseMatched<E, P, 0> extends true ? GetCaseResult<E, P, 0>
		: IsCaseMatched<E, P, 1> extends true ? GetCaseResult<E, P, 1>
		: IsCaseMatched<E, P, 2> extends true ? GetCaseResult<E, P, 2>
		: IsCaseMatched<E, P, 3> extends true ? GetCaseResult<E, P, 3>
		: IsCaseMatched<E, P, 4> extends true ? GetCaseResult<E, P, 4>
		: IsCaseMatched<E, P, 5> extends true ? GetCaseResult<E, P, 5>
		: IsCaseMatched<E, P, 6> extends true ? GetCaseResult<E, P, 6>
		: IsCaseMatched<E, P, 7> extends true ? GetCaseResult<E, P, 7>
		: IsCaseMatched<E, P, 8> extends true ? GetCaseResult<E, P, 8>
		: IsCaseMatched<E, P, 9> extends true ? GetCaseResult<E, P, 9>
		: Misskey.Endpoints[E]['res']['$switch']['$default']
	) : Misskey.Endpoints[E]['res']
);

export const pendingApiRequestsCount = ref(0);

// Implements Misskey.api.ApiClient.request
export const api = <
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
>(
	endpoint: E,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: P = {} as any,
	token?: string | null | undefined,
	signal?: AbortSignal,
): Promise<APIResultType<E, P>> => {
	pendingApiRequestsCount.value++;

	const onFinally = (): void => {
		pendingApiRequestsCount.value--;
	};

	const promise = new Promise<APIResultType<E, P> | void>((resolve, reject) => {
		// Append a credential
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ($i) (data as any).i = $i.token;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (token != null) (data as any).i = token;

		// Send request
		window.fetch(`${apiUrl}/${endpoint}`, {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'omit',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		}).then(async (res) => {
			const body = res.status === 204 ? null : await res.json();

			if (res.status === 200) {
				resolve(body);
			} else if (res.status === 204) {
				resolve();
			} else {
				reject(body.error);
			}
		}).catch(reject);
	});

	promise.then(onFinally, onFinally);

	return promise;
};

export const apiExternal = <
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
>(
	hostUrl: string,
	endpoint: E,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: P = {} as any,
	token?: string | null | undefined,
	signal?: AbortSignal,
): Promise<APIResultType<E, P>> => {
	if (checkHttpOrHttps(hostUrl)) throw new Error('invalid host name');
	if (endpoint.includes('://')) throw new Error('invalid endpoint');
	pendingApiRequestsCount.value++;

	const onFinally = () => {
		pendingApiRequestsCount.value--;
	};

	const promise = new Promise<Misskey.Endpoints[E]['res'] | void>((resolve, reject) => {
		// Append a credential
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (token != null) (data as any).i = token;

		const fullUrl = `${hostUrl.endsWith('/') ? hostUrl.slice(0, -1) : hostUrl}/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

		// Send request
		window.fetch(fullUrl, {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'omit',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		}).then(async (res) => {
			const body = res.status === 204 ? null : await res.json();

			if (res.status === 200) {
				resolve(body);
			} else if (res.status === 204) {
				resolve();
			} else {
				reject(body.error);
			}
		}).catch(reject);
	});

	promise.then(onFinally, onFinally);

	return promise;
};

// Implements Misskey.api.ApiClient.request
export const apiGet = <
	E extends keyof Misskey.Endpoints,
	P extends Misskey.Endpoints[E]['req'],
>(
	endpoint: E,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: P = {} as any,
): Promise<APIResultType<E, P>> => {
	pendingApiRequestsCount.value++;

	const onFinally = (): void => {
		pendingApiRequestsCount.value--;
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const query = new URLSearchParams(data as any);

	const promise = new Promise<APIResultType<E, P> | void>((resolve, reject) => {
		// Send request
		window.fetch(`${apiUrl}/${endpoint}?${query}`, {
			method: 'GET',
			credentials: 'omit',
			cache: 'default',
		}).then(async (res) => {
			const body = res.status === 204 ? null : await res.json();

			if (res.status === 200) {
				resolve(body);
			} else if (res.status === 204) {
				resolve();
			} else {
				reject(body.error);
			}
		}).catch(reject);
	});

	promise.then(onFinally, onFinally);

	return promise;
};
