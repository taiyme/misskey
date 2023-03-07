<template>
<div v-if="show" ref="el" class="fdidabkb" :style="{ background: bg }">
	<div class="upper" :class="{ slim: narrow, thin: thin_ }">
		<div v-if="!thin_ && narrow && props.displayMyAvatar && $i" class="_button buttons left" @click="openAccountMenu">
			<MkAvatar class="avatar" :user="$i" :disable-preview="true"/>
		</div>
		<div v-else-if="!thin_ && narrow && !hideTitle" class="buttons left"></div>

		<template v-if="metadata">
			<div v-if="!hideTitle" class="titleContainer" @click="top">
				<MkAvatar v-if="metadata.avatar" class="avatar" :user="metadata.avatar" :disable-preview="true" :show-indicator="true"/>
				<i v-else-if="metadata.icon" class="icon" :class="metadata.icon"></i>

				<div class="title">
					<MkUserName v-if="metadata.userName" :user="metadata.userName" :nowrap="true"/>
					<div v-else-if="metadata.title">{{ metadata.title }}</div>
					<div v-if="metadata.subtitle" class="subtitle">
						{{ metadata.subtitle }}
					</div>
				</div>
			</div>
			<XTabs v-if="!narrow || hideTitle" class="tabs" :tab="tab" :tabs="tabs" :root-el="el" @update:tab="key => emit('update:tab', key)" @tab-click="onTabClick"/>
		</template>
		<div v-if="(!thin_ && narrow && !hideTitle) || (actions && actions.length > 0)" class="buttons right">
			<template v-for="action in actions">
				<button v-tooltip.noDelay="action.text" class="_button button" :class="{ highlighted: action.highlighted }" @click.stop="action.handler" @touchstart="preventDrag"><i :class="action.icon"></i></button>
			</template>
		</div>
	</div>
	<div v-if="(narrow && !hideTitle) && hasTabs" class="lower" :class="{ slim: narrow, thin: thin_ }">
		<XTabs class="tabs" :tab="tab" :tabs="tabs" :root-el="el" @update:tab="key => emit('update:tab', key)" @tab-click="onTabClick"/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, inject } from 'vue';
import tinycolor from 'tinycolor2';
import XTabs, { Tab } from './MkPageHeader.tabs.vue';
import { scrollToTop } from '@/scripts/scroll';
import { globalEvents } from '@/events';
import { injectPageMetadata } from '@/scripts/page-metadata';
import { $i, openAccountMenu as openAccountMenu_ } from '@/account';

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	tab?: string;
	actions?: {
		text: string;
		icon: string;
		highlighted?: boolean;
		handler: (ev: MouseEvent) => void;
	}[];
	thin?: boolean;
	displayMyAvatar?: boolean;
}>(), {
	tabs: () => ([] as Tab[]),
});

const emit = defineEmits<{
	(ev: 'update:tab', key: string);
}>();

const metadata = injectPageMetadata();

const hideTitle = inject('shouldOmitHeaderTitle', false);
const thin_ = props.thin || inject('shouldHeaderThin', false);

let el = $shallowRef<HTMLElement | undefined>(undefined);
const bg = ref<string | undefined>(undefined);
let narrow = $ref(false);
const hasTabs = $computed(() => props.tabs.length > 0);
const hasActions = $computed(() => props.actions && props.actions.length > 0);
const show = $computed(() => {
	return !hideTitle || hasTabs || hasActions;
});

const preventDrag = (ev: TouchEvent) => {
	ev.stopPropagation();
};

const top = () => {
	if (el) {
		scrollToTop(el as HTMLElement, { behavior: 'smooth' });
	}
};

function openAccountMenu(ev: MouseEvent) {
	openAccountMenu_({
		withExtraOperation: true,
	}, ev);
}

function onTabClick(): void {
	top();
}

const calcBg = () => {
	const rawBg = 'var(--bg)';
	const tinyBg = tinycolor(rawBg.startsWith('var(') ? getComputedStyle(document.documentElement).getPropertyValue(rawBg.slice(4, -1)) : rawBg);
	tinyBg.setAlpha(0.85);
	bg.value = tinyBg.toRgbString();
};

let ro: ResizeObserver | null;

onMounted(() => {
	calcBg();
	globalEvents.on('themeChanged', calcBg);

	if (el && el.parentElement) {
		narrow = el.parentElement.offsetWidth < 500;
		ro = new ResizeObserver((entries, observer) => {
			if (el && el.parentElement && document.body.contains(el as HTMLElement)) {
				narrow = el.parentElement.offsetWidth < 500;
			}
		});
		ro.observe(el.parentElement as HTMLElement);
	}
});

onUnmounted(() => {
	globalEvents.off('themeChanged', calcBg);
	if (ro) ro.disconnect();
});
</script>
