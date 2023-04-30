<template>
<div ref="rootEl" :class="$style.tabs" @wheel="onTabWheel">
	<div :class="$style.tabsInner">
		<button
			v-for="t in tabs"
			:key="t.key"
			:ref="(el) => tabRefs[t.key] = (el as HTMLElement)"
			v-tooltip.no-delay="t.title"
			class="_button"
			:class="[$style.tab, { [$style.active]: t.key != null && t.key === props.tab, [$style.animate]: defaultStore.reactiveState.animation.value }]"
			@mousedown="(ev) => onTabMousedown(t, ev)"
			@click="(ev) => onTabClick(t, ev)"
		>
			<div :class="$style.tabInner">
				<i v-if="t.icon" :class="[$style.tabIcon, t.icon]"></i>
				<div
					v-if="!t.iconOnly || (!defaultStore.reactiveState.animation.value && t.key === tab)"
					:class="$style.tabTitle"
				>
					{{ t.title }}
				</div>
				<Transition
					v-else
					mode="in-out"
					@enter="enter"
					@after-enter="afterEnter"
					@leave="leave"
					@after-leave="afterLeave"
				>
					<div v-show="t.key === tab" :class="[$style.tabTitle, $style.animate]">{{ t.title }}</div>
				</transition>
			</div>
		</button>
	</div>
	<div
		ref="tabHighlightEl"
		:class="[$style.tabHighlight, { [$style.animate]: defaultStore.reactiveState.animation.value }]"
	></div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue';
import { defaultStore } from '@/store';

export type Tab = {
	key: string;
	title: string;
	icon?: string;
	iconOnly?: boolean;
	onClick?: (ev: MouseEvent) => void;
} & {
	iconOnly: true;
	icon: string;
};

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	tab?: string;
	rootEl?: HTMLElement;
}>(), {
	tabs: (): Tab[] => [],
	tab: undefined,
	rootEl: undefined,
});

const emit = defineEmits<{
	(ev: 'update:tab', key: string);
	(ev: 'tabClick', key: string);
}>();

const rootEl = shallowRef<HTMLElement | null>(null);
const tabRefs: Record<string, HTMLElement | null> = {};
const tabHighlightEl = shallowRef<HTMLElement | null>(null);

const onTabMousedown = (tab: Tab, _ev: MouseEvent): void => {
	// ユーザビリティの観点からmousedown時にはonClickは呼ばない
	if (tab.key) {
		emit('update:tab', tab.key);
	}
};

const onTabClick = (t: Tab, ev: MouseEvent): void => {
	emit('tabClick', t.key);

	if (t.onClick) {
		ev.preventDefault();
		ev.stopPropagation();
		t.onClick(ev);
	}

	if (t.key) {
		emit('update:tab', t.key);
	}
};

const renderTab = (): void => {
	const tabEl = props.tab ? tabRefs[props.tab] : undefined;
	if (tabEl && tabHighlightEl.value && tabHighlightEl.value.parentElement) {
		// offsetWidth や offsetLeft は少数を丸めてしまうため getBoundingClientRect を使う必要がある
		// https://developer.mozilla.org/ja/docs/Web/API/HTMLElement/offsetWidth#%E5%80%A4
		const parentRect = tabHighlightEl.value.parentElement.getBoundingClientRect();
		const rect = tabEl.getBoundingClientRect();
		tabHighlightEl.value.style.width = `${rect.width}px`;
		tabHighlightEl.value.style.left = `${rect.left - parentRect.left + tabHighlightEl.value.parentElement.scrollLeft}px`;
	}
};

const onTabWheel = (ev: WheelEvent): boolean => {
	if (ev.currentTarget instanceof HTMLElement && ev.deltaY !== 0 && ev.deltaX === 0) {
		ev.preventDefault();
		ev.stopPropagation();
		ev.currentTarget.scrollBy({
			left: ev.deltaY,
			behavior: 'instant' as ScrollBehavior,
		});
	}
	return false;
};

let entering = false;

const enter = async (el: HTMLElement): Promise<void> => {
	entering = true;
	const { width: elementWidth } = el.getBoundingClientRect();
	el.style.width = '0';
	el.style.paddingLeft = '0';
	el.offsetWidth; // force reflow
	el.style.width = `${elementWidth}px`;
	el.style.paddingLeft = '';
	nextTick(() => {
		entering = false;
	});

	setTimeout(renderTab, 170);
};

const afterEnter = (_el: HTMLElement): void => {
	//_el.style.width = '';
};

const leave = async (el: HTMLElement): Promise<void> => {
	const { width: elementWidth } = el.getBoundingClientRect();
	el.style.width = `${elementWidth}px`;
	el.style.paddingLeft = '';
	el.offsetWidth; // force reflow
	el.style.width = '0';
	el.style.paddingLeft = '0';
};

const afterLeave = (el: HTMLElement): void => {
	el.style.width = '';
};

let ro2: ResizeObserver | null;

onMounted(() => {
	watch([
		(): string | undefined => props.tab,
		(): Tab[] => props.tabs,
	], () => {
		nextTick(() => {
			if (entering) return;
			renderTab();
		});
	}, {
		immediate: true,
	});

	if (props.rootEl) {
		ro2 = new ResizeObserver(() => {
			if (document.body.contains(rootEl.value)) {
				nextTick(() => renderTab());
			}
		});
		ro2.observe(props.rootEl);
	}
});

onUnmounted(() => {
	if (ro2) ro2.disconnect();
});
</script>

<style lang="scss" module>
.tabs {
	display: block;
	position: relative;
	margin: 0;
	height: var(--height);
	font-size: 0.8em;
	text-align: center;
	overflow-x: auto;
	overflow-y: hidden; // fallback (overflow: clip)
	overflow-y: clip;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.tabsInner {
	display: inline-block;
	height: var(--height);
	white-space: nowrap;
}

.tab {
	display: inline-block;
	position: relative;
	padding: 0 10px;
	height: 100%;
	font-weight: normal;
	opacity: 0.7;

	&:hover {
		opacity: 1;
	}

	&.active {
		opacity: 1;
	}

	&.animate {
		transition: opacity 0.2s ease;
	}
}

.tabInner {
	display: flex;
	align-items: center;
}

.tabIcon + .tabTitle {
	padding-left: 4px;
}

.tabTitle {
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;

	&.animate {
		transition: width .15s linear, padding-left .15s linear;
	}
}

.tabHighlight {
	position: absolute;
	bottom: 0;
	height: 3px;
	background: var(--accent);
	border-radius: 999px;
	transition: none;
	pointer-events: none;

	&.animate {
		transition: width 0.15s ease, left 0.15s ease;
	}
}
</style>
