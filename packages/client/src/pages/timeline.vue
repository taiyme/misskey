<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="headerTabs" :display-my-avatar="true"/></template>
	<MkSpacer :content-max="800">
		<div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
			<XTutorial v-if="defaultStore.reactiveState.tutorial.value != -1" class="tutorial _block"/>
			<TmsPostForm v-if="defaultStore.reactiveState.showFixedPostForm.value" class="post-form _block" fixed/>

			<div v-if="queue > 0" class="new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
			<div class="tl _block">
				<MkTimeline
					ref="tl"
					:key="src"
					class="tl"
					:src="src"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, watch, provide } from 'vue';
import MkTimeline from '@/components/MkTimeline.vue';
import TmsPostForm from '@/components/TmsPostForm.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';

provide('shouldOmitHeaderTitle', true);

const XTutorial = defineAsyncComponent(() => import('./timeline.tutorial.vue'));

const isLocalTimelineAvailable = !instance.disableLocalTimeline || ($i != null && ($i.isModerator || $i.isAdmin));
const isGlobalTimelineAvailable = !instance.disableGlobalTimeline || ($i != null && ($i.isModerator || $i.isAdmin));
const keymap = $computed(() => ({
	// 't': focus,
}));

// const tlComponent = $ref<InstanceType<typeof MkTimeline>>();
const rootEl = $ref<HTMLElement>();

let queue = $ref(0);
const src = $computed({ get: () => defaultStore.reactiveState.tl.value.src, set: (x) => saveSrc(x) });

watch ($$(src), () => queue = 0);

const queueUpdated = (q: number): void => {
	queue = q;
};

const top = (): void => {
	if (!rootEl) return;
	scroll(rootEl, { top: 0 });
};

const chooseList = async (ev: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	const lists = await os.api('users/lists/list');
	const items = lists.map(list => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, el);
};

const chooseAntenna = async (ev: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	const antennas = await os.api('antennas/list');
	const items = antennas.map(antenna => ({
		type: 'link' as const,
		text: antenna.name,
		indicate: antenna.hasUnreadNote,
		to: `/timeline/antenna/${antenna.id}`,
	}));
	os.popupMenu(items, el);
};

const chooseChannel = async (ev: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	const channels = await os.api('channels/followed', {
		limit: 100,
	});
	const items = channels?.map(channel => ({
		type: 'link' as const,
		text: channel.name,
		indicate: channel.hasUnreadNote,
		to: `/channels/${channel.id}`,
	})) ?? [];
	os.popupMenu(items, el);
};

const saveSrc = (newSrc: 'home' | 'local' | 'social' | 'global'): void => {
	defaultStore.set('tl', {
		...defaultStore.state.tl,
		src: newSrc,
	});
};

// const timetravel = async (): Promise<void> => {
// 	if (!tlComponent) return;

// 	const { canceled, result: date } = await os.inputDate({
// 		title: i18n.ts.date,
// 	});
// 	if (canceled) return;

// 	tlComponent.timetravel(date);
// };

// const focus = (): void => {
// 	tlComponent?.focus();
// };

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'home',
	title: i18n.ts._timelines.home,
	icon: 'ti ti-home',
	iconOnly: true,
}, ...(isLocalTimelineAvailable ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'ti ti-planet',
	iconOnly: true,
}, {
	key: 'social',
	title: i18n.ts._timelines.social,
	icon: 'ti ti-rocket',
	iconOnly: true,
}] : []), ...(isGlobalTimelineAvailable ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'ti ti-whirl',
	iconOnly: true,
}] : []), {
	icon: 'ti ti-list',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}, {
	icon: 'ti ti-antenna',
	title: i18n.ts.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}, {
	icon: 'ti ti-device-tv',
	title: i18n.ts.channel,
	iconOnly: true,
	onClick: chooseChannel,
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'ti ti-planet' : src === 'social' ? 'ti ti-rocket' : src === 'global' ? 'ti ti-whirl' : 'ti ti-home',
})));
</script>

<style lang="scss" scoped>
.cmuxhskf {
	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: hidden; // fallback (overflow: clip)
		overflow: clip;
	}
}
</style>
