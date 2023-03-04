type Words = (string | string[])[];

export const renderWords = (words: Words): string => {
	return words.map(x => {
		return Array.isArray(x) ? x.join(' ') : x;
	}).join('\n');
};

export const parseWords = (renderedWords: string): Words => {
	const lines: Words = renderedWords.trim().split('\n').map(line => line.trim()).filter(line => line !== '');

	for (const [i, line] of lines.entries()) {
		const regexp = (line as string).match(/^\/(.+)\/(.*)$/);
		if (regexp) {
			const [, pattern, flags] = regexp;
			try {
				new RegExp(pattern, flags);
			} catch {
				throw new Error();
			}
		} else {
			lines[i] = (line as string).split(' ').map(word => word.trim()).filter(word => word !== '');
		}
	}

	return lines;
};

export const checkWords = (words: Words | string): boolean => {
	try {
		parseWords(typeof words === 'string' ? words : renderWords(words));
		return true;
	} catch {
		return false;
	}
};
