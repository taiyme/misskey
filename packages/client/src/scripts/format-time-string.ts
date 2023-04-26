const defaultLocaleStringFormats = {
	'weekday': 'narrow',
	'era': 'narrow',
	'year': 'numeric',
	'month': 'numeric',
	'day': 'numeric',
	'hour': 'numeric',
	'minute': 'numeric',
	'second': 'numeric',
	'timeZoneName': 'short',
};

const formatLocaleString = (date: Date, format: string): string => {
	return format.replace(/\{\{(\w+)(:(\w+))?\}\}/g, (match: string, kind: string, unused?, option?: string) => {
		if (Object.keys(defaultLocaleStringFormats).includes(kind)) {
			return date.toLocaleString(window.navigator.language, { [kind]: option ? option : defaultLocaleStringFormats[kind] });
		} else {
			return match;
		}
	});
};

export const formatDateTimeString = (date: Date, format: string): string => {
	const padNumber = (n: number | string, maxLength?: number): string => {
		return n.toString().padStart(maxLength ?? 0, '0').slice(-(maxLength ?? 0));
	};

	return format
		.replace(/yyyy/g, padNumber(date.getFullYear()))
		.replace(/yy/g, padNumber(date.getFullYear(), 2))
		.replace(/MMMM/g, date.toLocaleString(window.navigator.language, { month: 'long' }))
		.replace(/MMM/g, date.toLocaleString(window.navigator.language, { month: 'short' }))
		.replace(/MM/g, padNumber(date.getMonth() + 1, 2))
		.replace(/M/g, padNumber(date.getMonth() + 1))
		.replace(/dd/g, padNumber(date.getDate(), 2))
		.replace(/d/g, padNumber(date.getDate()))
		.replace(/HH/g, padNumber(date.getHours(), 2))
		.replace(/H/g, padNumber(date.getHours()))
		.replace(/hh/g, padNumber((date.getHours() % 12) || 12, 2))
		.replace(/h/g, padNumber((date.getHours() % 12) || 12))
		.replace(/mm/g, padNumber(date.getMinutes(), 2))
		.replace(/m/g, padNumber(date.getMinutes()))
		.replace(/ss/g, padNumber(date.getSeconds(), 2))
		.replace(/s/g, padNumber(date.getSeconds()))
		.replace(/tt/g, date.getHours() >= 12 ? 'PM' : 'AM');
};

export const formatTimeString = (date: Date, format: string): string => {
	return format.replace(/\[(([^\[]|\[\])*)\]|(([yMdHhmst])\4{0,3})/g, (match: string, localeformat?: string, unused?, datetimeformat?: string) => {
		if (localeformat) return formatLocaleString(date, localeformat);
		if (datetimeformat) return formatDateTimeString(date, datetimeformat);
		return match;
	});
};
