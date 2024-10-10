/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const preventLongPressContextMenu = () => {
	let touching = false;
	let touchCanceled = false;

	const onTouchStart = () => {
		touching = true;
		touchCanceled = false;
	};

	const onTouchMove = () => {
		touching = true;
		touchCanceled = false;
	};

	const onTouchEnd = () => {
		touching = false;
		touchCanceled = false;
	};

	const onTouchCancel = () => {
		touching = false;
		touchCanceled = true;
	};

	document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
	document.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });
	document.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
	document.addEventListener('touchcancel', onTouchCancel, { passive: true, capture: true });
	document.addEventListener('click', onTouchEnd, { passive: true, capture: true });
	document.addEventListener('contextmenu', (ev) => {
		if (touchCanceled || touching) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		onTouchEnd();
	}, { passive: false, capture: true });
};
