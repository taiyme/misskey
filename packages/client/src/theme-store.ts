import { Theme } from './scripts/theme';
import { api } from '@/os';
import { $i } from '@/account';
import { parseArray } from '@/scripts/tms/parse';

const lsCacheKey = $i ? `themes:${$i.id}` : '';

export const getThemes = (): Theme[] => {
	return parseArray<Theme[]>(localStorage.getItem(lsCacheKey));
};

export const fetchThemes = async (): Promise<void> => {
	if ($i == null) return;

	try {
		const themes = await api('i/registry/get', { scope: ['client'], key: 'themes' });
		localStorage.setItem(lsCacheKey, JSON.stringify(themes));
	} catch (err) {
		if (err.code === 'NO_SUCH_KEY') return;
		throw err;
	}
};

export const addTheme = async (theme: Theme): Promise<void> => {
	await fetchThemes();
	const themes = getThemes().concat(theme);
	await api('i/registry/set', { scope: ['client'], key: 'themes', value: themes });
	localStorage.setItem(lsCacheKey, JSON.stringify(themes));
};

export const removeTheme = async (theme: Theme): Promise<void> => {
	const themes = getThemes().filter(t => t.id !== theme.id);
	await api('i/registry/set', { scope: ['client'], key: 'themes', value: themes });
	localStorage.setItem(lsCacheKey, JSON.stringify(themes));
};
