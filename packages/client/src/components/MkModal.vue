<template>
<Transition
	:name="transitionName"
	:duration="transitionDuration"
	appear
	@after-leave="emit('closed')"
	@enter="emit('opening')"
	@after-enter="onOpened"
>
	<div
		v-show="manualShowing != null ? manualShowing : showing"
		v-hotkey.global="keymap"
		class="qzhlnise"
		:class="{ drawer: type === 'drawer', dialog: type === 'dialog' || type === 'dialog:top', popup: type === 'popup' }"
		:style="{ zIndex, pointerEvents: (manualShowing != null ? manualShowing : showing) ? 'auto' : 'none', '--transformOrigin': transformOrigin }"
	>
		<div
			class="bg _modalBg"
			:class="{ transparent: transparentBg && (type === 'popup') }"
			:style="{ zIndex }"
			@click="onBgClick"
			@contextmenu.prevent.stop="() => {}"
		></div>
		<div
			ref="content"
			class="content"
			:class="{ fixed, top: type === 'dialog:top' }"
			:style="{ zIndex }"
			@click.self="onBgClick"
		>
			<slot :max-height="maxHeight" :type="type"></slot>
		</div>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch, provide } from 'vue';
import * as os from '@/os';
import { isTouchUsing } from '@/scripts/touch';
import { defaultStore } from '@/store';
import { deviceKind } from '@/scripts/device-kind';
import { pushHash, trimHash } from '@/scripts/tms/url-hash';

const getFixedContainer = (el: HTMLElement | null): HTMLElement | null => {
	if (el == null || el.tagName === 'BODY') return null;
	const position = window.getComputedStyle(el).getPropertyValue('position');
	if (position === 'fixed') {
		return el;
	} else {
		return getFixedContainer(el.parentElement);
	}
};

type ModalTypes = 'popup' | 'dialog' | 'dialog:top' | 'drawer';

const props = withDefaults(defineProps<{
	manualShowing?: boolean | null;
	anchor?: { x: string; y: string; };
	src?: HTMLElement;
	preferType?: ModalTypes | 'auto';
	zPriority?: 'low' | 'middle' | 'high';
	noOverlap?: boolean;
	transparentBg?: boolean;
}>(), {
	manualShowing: null,
	src: undefined,
	anchor: () => ({ x: 'center', y: 'bottom' }),
	preferType: 'auto',
	zPriority: 'low',
	noOverlap: true,
	transparentBg: false,
});

const emit = defineEmits<{
	(ev: 'opening'): void;
	(ev: 'opened'): void;
	(ev: 'click'): void;
	(ev: 'esc'): void;
	(ev: 'close'): void;
	(ev: 'closed'): void;
}>();

provide('modal', true);

let maxHeight = $ref<number>();
let fixed = $ref(false);
let transformOrigin = $ref('center');
let showing = $ref(true);
let content = $ref<HTMLElement>();
const zIndex = os.claimZIndex(props.zPriority);
let useSendAnime = $ref(false);
const type = $computed(() => {
	if (props.preferType === 'auto') {
		if (!defaultStore.state.disableDrawer && isTouchUsing && deviceKind === 'smartphone') {
			return 'drawer';
		} else {
			return props.src != null ? 'popup' : 'dialog';
		}
	} else {
		return props.preferType;
	}
});
let transitionName = $computed((() =>
	defaultStore.state.animation
		? useSendAnime
			? 'send'
			: type === 'drawer'
				? 'modal-drawer'
				: type === 'popup'
					? 'modal-popup'
					: 'modal'
		: ''
));
let transitionDuration = $computed((() =>
	transitionName === 'send'
		? 400
		: transitionName === 'modal-popup'
			? 100
			: transitionName === 'modal'
				? 200
				: transitionName === 'modal-drawer'
					? 200
					: 0
));

let contentClicking = false;

if (type === 'drawer') {
	maxHeight = window.innerHeight / 1.5;
}

const keymap = {
	'esc': (): void => emit('esc'),
};

const MARGIN = 16;
const SCROLLBAR_THICKNESS = 16;

const align = (): void => {
	if (props.src == null) return;
	if (type === 'drawer') return;
	if (type === 'dialog') return;

	if (content == null) return;

	const srcRect = props.src.getBoundingClientRect();

	const width = content.offsetWidth;
	const height = content.offsetHeight;

	let left = 0;
	let top = 0;

	const x = srcRect.left + (fixed ? 0 : window.pageXOffset);
	const y = srcRect.top + (fixed ? 0 : window.pageYOffset);

	if (props.anchor.x === 'center') {
		left = x + (props.src.offsetWidth / 2) - (width / 2);
	} else if (props.anchor.x === 'left') {
		// TODO
	} else if (props.anchor.x === 'right') {
		left = x + props.src.offsetWidth;
	}

	if (props.anchor.y === 'center') {
		top = (y - (height / 2));
	} else if (props.anchor.y === 'top') {
		// TODO
	} else if (props.anchor.y === 'bottom') {
		top = y + props.src.offsetHeight;
	}

	if (fixed) {
		// 画面から横にはみ出る場合
		if (left + width > (window.innerWidth - SCROLLBAR_THICKNESS)) {
			left = (window.innerWidth - SCROLLBAR_THICKNESS) - width;
		}

		const underSpace = ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN) - top;
		const upperSpace = (srcRect.top - MARGIN);

		// 画面から縦にはみ出る場合
		if (top + height > ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN)) {
			if (props.noOverlap && props.anchor.x === 'center') {
				if (underSpace >= (upperSpace / 3)) {
					maxHeight = underSpace;
				} else {
					maxHeight = upperSpace;
					top = (upperSpace + MARGIN) - height;
				}
			} else {
				top = ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN) - height;
			}
		} else {
			maxHeight = underSpace;
		}
	} else {
		// 画面から横にはみ出る場合
		if (left + width - window.pageXOffset > (window.innerWidth - SCROLLBAR_THICKNESS)) {
			left = (window.innerWidth - SCROLLBAR_THICKNESS) - width + window.pageXOffset - 1;
		}

		const underSpace = ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN) - (top - window.pageYOffset);
		const upperSpace = (srcRect.top - MARGIN);

		// 画面から縦にはみ出る場合
		if (top + height - window.pageYOffset > ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN)) {
			if (props.noOverlap && props.anchor.x === 'center') {
				if (underSpace >= (upperSpace / 3)) {
					maxHeight = underSpace;
				} else {
					maxHeight = upperSpace;
					top = window.pageYOffset + ((upperSpace + MARGIN) - height);
				}
			} else {
				top = ((window.innerHeight - SCROLLBAR_THICKNESS) - MARGIN) - height + window.pageYOffset - 1;
			}
		} else {
			maxHeight = underSpace;
		}
	}

	if (top < 0) {
		top = MARGIN;
	}

	if (left < 0) {
		left = 0;
	}

	let transformOriginX = 'center';
	let transformOriginY = 'center';

	if (top >= srcRect.top + props.src.offsetHeight + (fixed ? 0 : window.pageYOffset)) {
		transformOriginY = 'top';
	} else if ((top + height) <= srcRect.top + (fixed ? 0 : window.pageYOffset)) {
		transformOriginY = 'bottom';
	}

	if (left >= srcRect.left + props.src.offsetWidth + (fixed ? 0 : window.pageXOffset)) {
		transformOriginX = 'left';
	} else if ((left + width) <= srcRect.left + (fixed ? 0 : window.pageXOffset)) {
		transformOriginX = 'right';
	}

	transformOrigin = `${transformOriginX} ${transformOriginY}`;

	content.style.left = left + 'px';
	content.style.top = top + 'px';
};

const onOpened = (): void => {
	emit('opened');

	if (type !== 'popup') {
		window.addEventListener('popstate', () => {
			if (!window.location.hash.endsWith(type) && !window.location.hash) {
				close();
				return;
			}
		});

		history.pushState(null, '', pushHash(window.location.hash, type));
	}

	// モーダルコンテンツにマウスボタンが押され、コンテンツ外でマウスボタンが離されたときにモーダルバックグラウンドクリックと判定させないためにマウスイベントを監視しフラグ管理する
	const el = content?.children[0];
	el?.addEventListener('mousedown', () => {
		contentClicking = true;
		window.addEventListener('mouseup', () => {
			// click イベントより先に mouseup イベントが発生するかもしれないのでちょっと待つ
			window.setTimeout(() => {
				contentClicking = false;
			}, 100);
		}, { passive: true, once: true });
	}, { passive: true });
};

const close = (opts: { useSendAnimation?: boolean } = {}): void => {
	if (opts.useSendAnimation) {
		useSendAnime = true;
	}

	// eslint-disable-next-line vue/no-mutating-props
	if (props.src) props.src.style.pointerEvents = 'auto';
	showing = false;

	if (type !== 'popup' && window.location.hash.endsWith(type)) {
		trimHash();
	}

	emit('close');
};

const onBgClick = (): void => {
	if (contentClicking) return;
	emit('click');
};

onMounted(() => {
	watch(() => props.src, async () => {
		// eslint-disable-next-line vue/no-mutating-props
		if (props.src) props.src.style.pointerEvents = 'none';
		fixed = (type === 'drawer') || (getFixedContainer(props.src ?? null) != null);

		await nextTick();

		align();
	}, { immediate: true });

	nextTick(() => {
		if (!content) return;
		new ResizeObserver(align).observe(content);
	});
});

defineExpose({
	close,
});
</script>

<style lang="scss" scoped>
.send-enter-active, .send-leave-active {
	> .bg {
		transition: opacity 0.3s !important;
	}

	> .content {
		transform: translateY(0px);
		transition: opacity 0.3s ease-in, transform 0.3s cubic-bezier(0.5, -0.5, 1, 0.5) !important;
	}
}

.send-enter-from, .send-leave-to {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform: translateY(-300px);
	}
}

.modal-enter-active, .modal-leave-active {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transform-origin: var(--transformOrigin);
		transition: opacity 0.2s, transform 0.2s !important;
	}
}

.modal-enter-from, .modal-leave-to {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform-origin: var(--transformOrigin);
		transform: scale(0.9);
	}
}

.modal-popup-enter-active, .modal-popup-leave-active {
	> .bg {
		transition: opacity 0.1s !important;
	}

	> .content {
		transform-origin: var(--transformOrigin);
		transition: opacity 0.1s cubic-bezier(0, 0, 0.2, 1), transform 0.1s cubic-bezier(0, 0, 0.2, 1) !important;
	}
}

.modal-popup-enter-from, .modal-popup-leave-to {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		opacity: 0;
		transform-origin: var(--transformOrigin);
		transform: scale(0.9);
	}
}

.modal-drawer-enter-active {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transition: transform 0.2s cubic-bezier(0, 0.5, 0, 1) !important;
	}
}

.modal-drawer-leave-active {
	> .bg {
		transition: opacity 0.2s !important;
	}

	> .content {
		transition: transform 0.2s cubic-bezier(0, 0.5, 0, 1) !important;
	}
}

.modal-drawer-enter-from, .modal-drawer-leave-to {
	> .bg {
		opacity: 0;
	}

	> .content {
		pointer-events: none;
		transform: translateY(100%);
	}
}

.qzhlnise {
	> .bg {
		&.transparent {
			background: transparent;
			-webkit-backdrop-filter: none;
			backdrop-filter: none;
		}
	}

	&.dialog {
		> .content {
			position: fixed;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
			padding: 32px;
			// TODO: mask-imageはiOSだとやたら重い。なんとかしたい
			-webkit-mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 32px, rgba(0, 0, 0, 1) calc(100% - 32px), rgba(0, 0, 0, 0) 100%);
			mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 32px, rgba(0, 0, 0, 1) calc(100% - 32px), rgba(0, 0, 0, 0) 100%);
			overflow: auto;
			display: flex;

			@media (max-width: 500px) {
				padding: 16px;
				-webkit-mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 16px, rgba(0, 0, 0, 1) calc(100% - 16px), rgba(0, 0, 0, 0) 100%);
				mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 16px, rgba(0, 0, 0, 1) calc(100% - 16px), rgba(0, 0, 0, 0) 100%);
			}

			> ::v-deep(*) {
				margin: auto;
			}

			&.top {
				> ::v-deep(*) {
					margin-top: 0;
				}
			}
		}
	}

	&.popup {
		> .content {
			position: absolute;

			&.fixed {
				position: fixed;
			}
		}
	}

	&.drawer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: clip;

		> .content {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;

			> ::v-deep(*) {
				margin: auto;
			}
		}
	}

}
</style>
