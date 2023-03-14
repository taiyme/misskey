const isArray = <T extends unknown[]>(v: unknown): v is T => {
	return Array.isArray(v);
};

const isObject = <T extends Record<string, unknown>>(v: unknown): v is T => {
	return v != null && typeof v === 'object' && !Array.isArray(v);
};

export const parseArray = <T extends unknown[]>(value: unknown): T => {
	if (isArray<T>(value)) return value;

	if (typeof value === 'string') {
		try {
			const result = JSON.parse(value || '[]') as unknown;
			if (isArray<T>(result)) return result;
		} catch {
			// empty
		}
	}

	return [] as unknown as T;
};

export const parseObject = <T extends Record<string, unknown>>(value: unknown): T => {
	if (isObject<T>(value)) return value;

	if (typeof value === 'string') {
		try {
			const result = JSON.parse(value || '{}') as unknown;
			if (isObject<T>(result)) return result;
		} catch {
			// empty
		}
	}

	return {} as unknown as T;
};
