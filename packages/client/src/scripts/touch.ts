const isTouchSupported = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;

export let isTouchUsing = false;

export let isScreenTouching = false;

export let disableContextmenu = false;

if (isTouchSupported) {
	let dcmTimeoutId: number | null = null;

	const dcmCancel = (): void => {
		if (dcmTimeoutId) {
			window.clearTimeout(dcmTimeoutId);
			dcmTimeoutId = null;
		}
	};

	const dmcHandler = (): void => {
		dcmCancel();
		disableContextmenu = true;
		dcmTimeoutId = window.setTimeout(() => {
			disableContextmenu = false;
		}, 2000);
	};

	window.addEventListener('touchstart', () => {
		// maxTouchPointsなどでの判定だけだと、「タッチ機能付きディスプレイを使っているがマウスでしか操作しない」場合にも
		// タッチで使っていると判定されてしまうため、実際に一度でもタッチされたらtrueにする
		isTouchUsing = true;

		isScreenTouching = true;

		dmcHandler();
	}, { passive: true });
	
	window.addEventListener('touchend', () => {
		// 子要素のtouchstartイベントでstopPropagation()が呼ばれると親要素に伝搬されずタッチされたと判定されないため、
		// touchendイベントでもtouchstartイベントと同様にtrueにする
		isTouchUsing = true;

		isScreenTouching = false;

		dmcHandler();
	}, { passive: true });
}
