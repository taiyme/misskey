import Koa from 'koa';
import { match } from 'ts-pattern';
import { fetchMeta } from '@/misc/fetch-meta.js';
import { deepClone } from '@/misc/clone.js';
import { FetchCustomImage } from '@/misc/tms/fetch-custom-image.js';
import manifest from './manifest.json' assert { type: 'json' };

export const manifestHandler = async (ctx: Koa.Context) => {
	const res = deepClone(manifest);

	const instance = await fetchMeta(true);
	const customImage = await FetchCustomImage();

	res.short_name = instance.name || 'Misskey';
	res.name = instance.name || 'Misskey';
	if (instance.themeColor) res.theme_color = instance.themeColor;

	res.icons = res.icons.map((icon) => {
		icon.src = match(icon.sizes)
			.with('192x192', () => customImage.pwaIcon192URL)
			.with('512x512', () => customImage.pwaIcon512URL)
			.otherwise(() => icon.src);

		return icon;
	});

	ctx.set('Cache-Control', 'max-age=300');
	ctx.body = res;
};
