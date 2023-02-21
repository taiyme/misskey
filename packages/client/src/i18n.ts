import { markRaw } from 'vue';
import { locale } from '@/config';
import { I18n } from '@/scripts/i18n';

export const i18n = markRaw(new I18n(locale));

export function updateI18n(newLocale) {
	i18n.ts = newLocale;
}

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$t: typeof i18n['t'];
		$ts: typeof i18n['locale'];
	}
}
