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
