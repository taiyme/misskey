<template>
<MkWindow
	ref="windowEl"
	:initial-width="500"
	:initial-height="500"
	:can-resize="true"
	:close-button="true"
	:buttons-left="buttonsLeft"
	:buttons-right="buttonsRight"
	:contextmenu="contextmenu"
	@closed="emit('closed')"
>
	<template #header>
		<template v-if="pageMetadata?.value">
			<i v-if="pageMetadata.value.icon" class="icon" :class="pageMetadata.value.icon" style="margin-right: 0.5em;"></i>
			<span>{{ pageMetadata.value.title }}</span>
		</template>
	</template>

	<div class="yrolvcoq" :style="{ background: pageMetadata?.value?.bg }">
		<RouterView :key="reloadCount" :router="router"/>
	</div>
</MkWindow>
</template>

<script lang="ts" setup>
import { ComputedRef, provide } from 'vue';
import RouterView from '@/components/global/RouterView.vue';
import MkWindow from '@/components/MkWindow.vue';
import { popout as _popout } from '@/scripts/popout';
import { copyText } from '@/scripts/tms/clipboard';
import { url } from '@/config';
import { mainRouter, routes } from '@/router';
import { Router } from '@/nirax';
import { i18n } from '@/i18n';
import { PageMetadata, provideMetadataReceiver } from '@/scripts/page-metadata';

const props = defineProps<{
	initialPath: string;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const router = new Router(routes, props.initialPath);

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();
const windowEl = $ref<InstanceType<typeof MkWindow>>();
const history = $ref<{ path: string; key: any; }[]>([{
	path: router.getCurrentPath(),
	key: router.getCurrentKey(),
}]);
const buttonsLeft = $computed(() => {
	const buttons: unknown[] = [];

	if (history.length > 1) {
		buttons.push({
			icon: 'ti ti-arrow-left',
			onClick: back,
		});
	}

	return buttons;
});
const buttonsRight = $computed(() => {
	const buttons: unknown[] = [{
		icon: 'ti ti-reload',
		title: i18n.ts.reload,
		onClick: reload,
	}, {
		icon: 'ti ti-player-eject',
		title: i18n.ts.showInPage,
		onClick: expand,
	}];

	return buttons;
});
let reloadCount = $ref(0);

router.addListener('push', ctx => {
	history.push({ path: ctx.path, key: ctx.key });
});

provide('router', router);
provideMetadataReceiver((info) => {
	pageMetadata = info;
});
provide('shouldOmitHeaderTitle', true);
provide('shouldHeaderThin', true);

const contextmenu = $computed(() => ([{
	icon: 'ti ti-player-eject',
	text: i18n.ts.showInPage,
	action: expand,
}, {
	icon: 'ti ti-window-maximize',
	text: i18n.ts.popout,
	action: popout,
}, {
	icon: 'ti ti-external-link',
	text: i18n.ts.openInNewTab,
	action: (): void => {
		window.open(url + router.getCurrentPath(), '_blank');
		windowEl?.close();
	},
}, {
	icon: 'ti ti-link',
	text: i18n.ts.copyLink,
	action: (): void => {
		copyText(url + router.getCurrentPath());
	},
}]));

const back = (): void => {
	history.pop();
	router.replace(history[history.length - 1].path, history[history.length - 1].key);
};

const reload = (): void => {
	reloadCount++;
};

const close = (): void => {
	windowEl?.close();
};

const expand = (): void => {
	mainRouter.push(router.getCurrentPath(), 'forcePage');
	windowEl?.close();
};

const popout = (): void => {
	_popout(router.getCurrentPath(), windowEl?.$el);
	windowEl?.close();
};

defineExpose({
	close,
});
</script>

<style lang="scss" scoped>
.yrolvcoq {
	min-height: 100%;
	background: var(--bg);
}
</style>
