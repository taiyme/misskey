import copyToClipboard from '@/scripts/copy-to-clipboard';

export const copyText = async (text: unknown): Promise<boolean> => {
	if (typeof text !== 'string') return false;
	try {
		const result = await navigator.clipboard.writeText(text).then(() => true, () => false);
		if (result) return true;
		throw new Error();
	} catch {
		return copyToClipboard(text);
	}
};
