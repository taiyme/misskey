import { parseArray } from '@/scripts/tms/parse';

const remembering = new Map<string, number>(parseArray<[string, number][]>(localStorage.getItem('tmsRemembering')));

export const getRemembering = (key: string): number | null => {
	return remembering.get(key) ?? null;
};

export const setRemembering = (key: string, dateNumber: number): void => {
	localStorage.setItem('tmsRemembering', JSON.stringify([...remembering.set(key, dateNumber).entries()]));
};
