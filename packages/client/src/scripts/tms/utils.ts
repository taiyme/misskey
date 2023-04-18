export const getRandomArrayElements = <T>(arr: T[], count: number): T[] => {
	if (count >= arr.length) return arr;

	const result: T[] = [];

	while (result.length < count) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		const randomElement = arr[randomIndex];
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
