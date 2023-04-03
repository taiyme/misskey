<template>
<a ref="el" :href="to" :class="active ? activeClass : null" @click.prevent="nav" @contextmenu.prevent.stop="onContextmenu">
	<slot></slot>
</a>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as os from '@/os';
import { copyText } from '@/scripts/tms/clipboard';
import { url } from '@/config';
import { disableContextmenu } from '@/scripts/touch';
import { i18n } from '@/i18n';
import { useRouter } from '@/router';

const props = withDefaults(defineProps<{
	to: string;
	activeClass?: null | string;
	behavior?: null | 'window' | 'browser' | 'modalWindow';
}>(), {
	activeClass: null,
	behavior: null,
});

const router = useRouter();

const el = ref<HTMLAnchorElement>();

const active = $computed(() => {
	if (props.activeClass == null) return false;
	const resolved = router.resolve(props.to);
	if (resolved == null) return false;
	if (resolved.route.path === router.currentRoute.value.path) return true;
	if (resolved.route.name == null) return false;
	if (router.currentRoute.value.name == null) return false;
	return resolved.route.name === router.currentRoute.value.name;
});

const onContextmenu = (ev: MouseEvent): void => {
	if (disableContextmenu) return;
	const selection = window.getSelection();
	if (selection && selection.toString() !== '') return;
	os.contextMenu([
		{
			type: 'label',
			text: props.to,
		},
		{
			icon: 'ti ti-app-window',
			text: i18n.ts.openInWindow,
			action: (): void => {
				os.pageWindow(props.to);
			},
		},
		{
			icon: 'ti ti-player-eject',
			text: i18n.ts.showInPage,
			action: (): void => {
				router.push(props.to, 'forcePage');
			},
		},
		null,
		{
			icon: 'ti ti-external-link',
			text: i18n.ts.openInNewTab,
			action: (): void => {
				window.open(props.to, '_blank');
			},
		},
		{
			icon: 'ti ti-link',
			text: i18n.ts.copyLink,
			action: (): void => {
				copyText(`${url}${props.to}`);
			},
		},
	], ev);
};

const openWindow = (): void => {
	os.pageWindow(props.to);
};

const modalWindow = (): void => {
	os.modalPageWindow(props.to);
};

const nav = (ev: MouseEvent): void => {
	if (props.behavior === 'browser') {
		location.href = props.to;
		return;
	}

	if (props.behavior === 'window') {
		return openWindow();
	}

	if (props.behavior === 'modalWindow') {
		return modalWindow();
	}

	if (ev.shiftKey) {
		return openWindow();
	}

	router.push(props.to, ev.ctrlKey ? 'forcePage' : null);
};

const getAnchorElement = (): HTMLAnchorElement | null => {
	return el.value ?? null;
};

defineExpose({
	getAnchorElement,
});
</script>
