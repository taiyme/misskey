export const getRandomArrayElements = <T>(arr: T[], count: number): T[] => {
	if (count >= arr.length) return arr;

	const result: T[] = [];

	while (result.length < count) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const randomElement = arrayAt(arr, randomIndex)!;
		if (result.indexOf(randomElement) === -1) {
			result.push(randomElement);
		}
	}

	return result;
};

export const isHtmlElement = <T extends HTMLElement>(value: unknown): value is T => {
	return value instanceof HTMLElement;
};

export const getHtmlElementFromEvent = <T extends HTMLElement>(event?: Event | null): T | null => {
	const el = event?.currentTarget ?? event?.target;
	return isHtmlElement<T>(el) ? el : null;
};

type TypedKeys<T extends Record<string, unknown>> = (keyof T)[];

type TypedValues<T extends Record<string, unknown>> = T[keyof T][];

type TypedEntries<T extends Record<string, unknown>> = {
	[K in keyof T]: [keyof Pick<T, K>, T[K]];
}[keyof T][];

export const typedKeys = <T extends Record<string, unknown>>(obj: T): TypedKeys<T> => {
	return Object.keys(obj) as unknown as TypedKeys<T>;
};

export const typedValues = <T extends Record<string, unknown>>(obj: T): TypedValues<T> => {
	return Object.values(obj) as unknown as TypedValues<T>;
};

export const typedEntries = <T extends Record<string, unknown>>(obj: T): TypedEntries<T> => {
	return Object.entries(obj) as unknown as TypedEntries<T>;
};

const toArray = <T>(arrayLike: T[] | ArrayLike<T>): T[] => Array.isArray(arrayLike) ? arrayLike : Array.from(arrayLike);

// Array<T>.prototype.at(index: number): T | undefined;
export const arrayAt = <T>(arrayLike: T[] | ArrayLike<T>, index: number): T | undefined => {
	const array = toArray(arrayLike);
	if (typeof Array.prototype.at === 'function') {
		return array.at(index);
	} else {
		const intIndex = Math.trunc(+index) || 0;
		const absIndex = intIndex >= 0 ? intIndex : array.length + intIndex;
		return (absIndex < 0 || absIndex >= array.length) ? undefined : array[absIndex];
	}
};
