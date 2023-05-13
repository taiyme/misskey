import Koa from 'koa';
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
	if (instance.themeColor) {
		res.theme_color = instance.themeColor;
		res.background_color = instance.themeColor;
	}

	res.icons = res.icons.map((icon) => {
		switch (icon.sizes) {
			case '192x192':
				icon.src = customImage.pwaIcon192URL;
				break;

			case '512x512':
				icon.src = customImage.pwaIcon512URL;
				break;

			default:
				break;
		}

		return icon;
	});

	ctx.set('Cache-Control', 'max-age=300');
	ctx.body = res;
};
