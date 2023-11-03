/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed, watch, version as vueVersion, App } from 'vue';
import widgets from '@/widgets/index.js';
import directives from '@/directives/index.js';
import components from '@/components/index.js';
import { version, lang, commitHash } from '@/config.js';
import { applyTheme } from '@/scripts/theme.js';
import { isDeviceDarkmode } from '@/scripts/is-device-darkmode.js';
import { checkUpdateLocale } from '@/scripts/tms/check-update-locale.js';
import { $i, refreshAccount, login } from '@/account.js';
import { defaultStore, ColdDeviceStorage } from '@/store.js';
import { fetchInstance, instance } from '@/instance.js';
import { deviceKind } from '@/scripts/device-kind.js';
import { reloadChannel } from '@/scripts/unison-reload.js';
import { getUrlWithoutLoginId } from '@/scripts/login-id.js';
import { getAccountFromId } from '@/scripts/get-account-from-id.js';
import { deckStore } from '@/ui/deck/deck-store.js';
import { miLocalStorage } from '@/local-storage.js';
import { fetchCustomEmojis } from '@/custom-emojis.js';
import { checkUpdated } from '@/scripts/tms/check-updated.js';
import { withV } from '@/scripts/tms/version.js';

export async function common(createVue: () => App<Element>) {
	console.info(`taiyme/misskey ${withV(version)} (${commitHash})`);

	if (_DEV_) {
		console.warn('Development mode!!!');

		console.info(`vue ${withV(vueVersion)}`);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).$i = $i;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).$store = defaultStore;

		window.addEventListener('error', event => {
			console.error(event);
			// alert({
			// 	type: 'error',
			// 	title: 'DEV: Unhandled error',
			// 	text: event.message,
			// });
		});

		window.addEventListener('unhandledrejection', event => {
			console.error(event);
			// alert({
			// 	type: 'error',
			// 	title: 'DEV: Unhandled promise rejection',
			// 	text: event.reason,
			// });
		});
	}

	const splash = document.getElementById('splash');
	// 念のためnullチェック(HTMLが古い場合があるため(そのうち消す))
	splash?.addEventListener('transitionend', () => {
		splash.remove();
	});

	//#region クライアントが更新されたかチェック
	const {
		isThemeRemoved,
		isClientUpdated,
		isCommitChanged,
	} = await checkUpdated();
	//#endregion

	//#region Detect language & fetch translations
	await checkUpdateLocale();
	//#endregion

	// タッチデバイスでCSSの:hoverを機能させる
	document.addEventListener('touchend', () => {}, { passive: true });

	// 一斉リロード
	reloadChannel.addEventListener('message', path => {
		if (path !== null) location.href = path;
		else location.reload();
	});

	// If mobile, insert the viewport meta tag
	if (['smartphone', 'tablet'].includes(deviceKind)) {
		const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
		viewport?.setAttribute('content', `${viewport.getAttribute('content')}, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`);
	}

	//#region Set lang attr
	document.documentElement.setAttribute('lang', lang);
	//#endregion

	await defaultStore.ready;
	await deckStore.ready;

	const fetchInstanceMetaPromise = fetchInstance();

	fetchInstanceMetaPromise.then(() => {
		miLocalStorage.setItem('v', instance.version);
	});

	//#region loginId
	const params = new URLSearchParams(location.search);
	const loginId = params.get('loginId');

	if (loginId) {
		const target = getUrlWithoutLoginId(location.href);

		if (!$i || $i.id !== loginId) {
			const account = await getAccountFromId(loginId);
			if (account) {
				await login(account.token, target);
			}
		}

		history.replaceState({ misskey: 'loginId' }, '', target);
	}
	//#endregion

	// NOTE: この処理は必ずクライアント更新チェック処理より後に来ること(テーマ再構築のため)
	watch(defaultStore.reactiveState.darkMode, (darkMode) => {
		applyTheme(darkMode ? ColdDeviceStorage.get('darkTheme') : ColdDeviceStorage.get('lightTheme'));
	}, { immediate: isThemeRemoved });

	const darkTheme = computed(ColdDeviceStorage.makeGetterSetter('darkTheme'));
	const lightTheme = computed(ColdDeviceStorage.makeGetterSetter('lightTheme'));

	watch(darkTheme, (theme) => {
		if (defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	watch(lightTheme, (theme) => {
		if (!defaultStore.state.darkMode) {
			applyTheme(theme);
		}
	});

	//#region Sync dark mode
	if (ColdDeviceStorage.get('syncDeviceDarkMode')) {
		defaultStore.set('darkMode', isDeviceDarkmode());
	}

	window.matchMedia('(prefers-color-scheme: dark)').addListener(mql => {
		if (ColdDeviceStorage.get('syncDeviceDarkMode')) {
			defaultStore.set('darkMode', mql.matches);
		}
	});
	//#endregion

	fetchInstanceMetaPromise.then(() => {
		if (defaultStore.state.themeInitial) {
			if (instance.defaultLightTheme != null) ColdDeviceStorage.set('lightTheme', JSON.parse(instance.defaultLightTheme));
			if (instance.defaultDarkTheme != null) ColdDeviceStorage.set('darkTheme', JSON.parse(instance.defaultDarkTheme));
			defaultStore.set('themeInitial', false);
		}
	});

	watch(defaultStore.reactiveState.useBlurEffectForModal, v => {
		document.documentElement.style.setProperty('--modalBgFilter', v ? 'blur(4px)' : 'none');
	}, { immediate: true });

	watch(defaultStore.reactiveState.useBlurEffect, v => {
		if (v) {
			document.documentElement.style.removeProperty('--blur');
		} else {
			document.documentElement.style.setProperty('--blur', 'none');
		}
	}, { immediate: true });

	if (defaultStore.state.keepScreenOn) {
		if ('wakeLock' in navigator) {
			navigator.wakeLock.request('screen');

			document.addEventListener('visibilitychange', async () => {
				if (document.visibilityState === 'visible') {
					navigator.wakeLock.request('screen');
				}
			});
		}
	}

	//#region Fetch user
	if ($i && $i.token) {
		if (_DEV_) {
			console.log('account cache found. refreshing...');
		}

		refreshAccount();
	}
	//#endregion

	try {
		await fetchCustomEmojis();
	} catch (err) { /* empty */ }

	const app = createVue();

	if (_DEV_) {
		app.config.performance = true;
	}

	widgets(app);
	directives(app);
	components(app);

	// https://github.com/misskey-dev/misskey/pull/8575#issuecomment-1114239210
	// なぜか2回実行されることがあるため、mountするdivを1つに制限する
	const rootEl = ((): HTMLElement => {
		const MISSKEY_MOUNT_DIV_ID = 'misskey_app';

		const currentRoot = document.getElementById(MISSKEY_MOUNT_DIV_ID);

		if (currentRoot) {
			console.warn('multiple import detected');
			return currentRoot;
		}

		const root = document.createElement('div');
		root.id = MISSKEY_MOUNT_DIV_ID;
		document.body.appendChild(root);
		return root;
	})();

	app.mount(rootEl);

	// boot.jsのやつを解除
	window.onerror = null;
	window.onunhandledrejection = null;

	removeSplash();

	return {
		isThemeRemoved,
		isClientUpdated,
		isCommitChanged,
		app,
	};
}

function removeSplash() {
	const splash = document.getElementById('splash');
	if (splash) {
		splash.style.opacity = '0';
		splash.style.pointerEvents = 'none';
	}
}
