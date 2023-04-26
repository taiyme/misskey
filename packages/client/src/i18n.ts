import { markRaw } from 'vue';
import { locale } from '@/config';
import { I18n } from '@/scripts/i18n';

export type I18nObject = {
	[K: `_${string}`]: I18nObject;
} & {
	[K: string]: string;
};

export const i18n = markRaw(new I18n<I18nObject>(locale));

export const updateI18n = (newLocale: I18nObject): void => {
	i18n.ts = newLocale;
};

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$t: typeof i18n['t'];
		$ts: typeof i18n['locale'];
	}
}
