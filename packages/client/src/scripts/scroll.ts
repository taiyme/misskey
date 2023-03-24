type ScrollBehavior = 'auto' | 'smooth' | 'instant';

export const getScrollContainer = (el: HTMLElement | null): HTMLElement | null => {
	if (el == null || el.tagName === 'HTML') return null;
	const overflow = window.getComputedStyle(el).getPropertyValue('overflow-y');
	if (overflow === 'scroll' || overflow === 'auto') {
		return el;
	} else {
		return getScrollContainer(el.parentElement);
	}
};

export const getStickyTop = (el: HTMLElement, container: HTMLElement | null = null, top = 0): number => {
	if (!el.parentElement) return top;
	const data = el.dataset.stickyContainerHeaderHeight;
	const newTop = data ? Number(data) + top : top;
	if (el === container) return newTop;
	return getStickyTop(el.parentElement, container, newTop);
};

export const getScrollPosition = (el: HTMLElement | null): number => {
	const container = getScrollContainer(el);
	return container == null ? window.scrollY : container.scrollTop;
};

export const onScrollTop = (el: HTMLElement, cb: () => unknown, tolerance = 1, once = false): (() => void) | null => {
	// とりあえず評価してみる
	if (isTopVisible(el)) {
		cb();
		if (once) return null;
	}

	const container = getScrollContainer(el) ?? window;

	const onScroll = (): void => {
		if (!document.body.contains(el)) return;
		if (isTopVisible(el, tolerance)) {
			cb();
			if (once) removeListener();
		}
	};

	const removeListener = (): void => container.removeEventListener('scroll', onScroll);
	container.addEventListener('scroll', onScroll, { passive: true });
	return removeListener;
};

export const onScrollBottom = (el: HTMLElement, cb: () => unknown, tolerance = 1, once = false): (() => void) | null => {
	const container = getScrollContainer(el);

	// とりあえず評価してみる
	if (isBottomVisible(el, tolerance, container)) {
		cb();
		if (once) return null;
	}

	const containerOrWindow = container ?? window;
	const onScroll = (): void => {
		if (!document.body.contains(el)) return;
		if (isBottomVisible(el, 1, container)) {
			cb();
			if (once) removeListener();
		}
	};

	const removeListener = (): void => containerOrWindow.removeEventListener('scroll', onScroll);
	containerOrWindow.addEventListener('scroll', onScroll, { passive: true });
	return removeListener;
};

export const scroll = (el: HTMLElement, options: ScrollToOptions | undefined): void => {
	const container = getScrollContainer(el);
	if (container == null) {
		window.scroll(options);
	} else {
		container.scroll(options);
	}
};

/**
 * Scroll to Top
 * @param el Scroll container element
 * @param options Scroll options
 */
export const scrollToTop = (el: HTMLElement, options: { behavior?: ScrollBehavior; } = {}): void => {
	scroll(el, { top: 0, ...options });
};

/**
 * Scroll to Bottom
 * @param el Content element
 * @param options Scroll options
 * @param container Scroll container element
 */
export const scrollToBottom = (
	el: HTMLElement,
	options: ScrollToOptions = {},
	container = getScrollContainer(el),
): void => {
	if (container) {
		container.scroll({ top: el.scrollHeight - container.clientHeight + getStickyTop(el, container) || 0, ...options });
	} else {
		window.scroll({
			top: (el.scrollHeight - window.innerHeight + getStickyTop(el, container) + (window.innerWidth <= 500 ? 96 : 0)) || 0,
			...options,
		});
	}
};

export const isTopVisible = (el: HTMLElement, tolerance = 1): boolean => {
	const scrollTop = getScrollPosition(el);
	return scrollTop <= tolerance;
};

export const isBottomVisible = (el: HTMLElement, tolerance = 1, container = getScrollContainer(el)): boolean => {
	if (container) return el.scrollHeight <= container.clientHeight + Math.abs(container.scrollTop) + tolerance;
	return el.scrollHeight <= window.innerHeight + window.scrollY + tolerance;
};

// https://ja.javascript.info/size-and-scroll-window#ref-932
export const getBodyScrollHeight = (): number => {
	return Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight,
	);
};
