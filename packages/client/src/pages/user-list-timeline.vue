<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div ref="rootEl" v-size="{ min: [800] }" class="eqqrhokj">
		<div v-if="queue > 0" class="new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
		<div class="tl _block">
			<MkTimeline
				ref="tlEl"
				:key="listId"
				class="tl"
				src="list"
				:list="listId"
				:sound="true"
				@queue="queueUpdated"
			/>
		</div>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { UserList } from 'misskey-js/built/entities';
import MkTimeline from '@/components/MkTimeline.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';

const router = useRouter();

const props = defineProps<{
	listId: string;
}>();

let list = $ref<UserList | null>(null);
let queue = $ref(0);
const tlEl = $ref<InstanceType<typeof MkTimeline>>();
const rootEl = $ref<HTMLElement>();

watch(() => props.listId, async () => {
	list = await os.api('users/lists/show', {
		listId: props.listId,
	});
}, { immediate: true });

const queueUpdated = (q): void => {
	queue = q;
};

const top = (): void => {
	if (!rootEl) return;
	scroll(rootEl, { top: 0 });
};

const settings = (): void => {
	router.push(`/my/lists/${props.listId}`);
};

// const timetravel = async (): Promise<void> => {
// 	if (!tlEl) return;

// 	const { canceled, result: date } = await os.inputDate({
// 		title: i18n.ts.date,
// 	});
// 	if (canceled) return;

// 	tlEl.timetravel(date);
// };

const headerActions = $computed(() => list ? [{
	icon: 'ti ti-calendar-time',
	text: i18n.ts.jumpToSpecifiedDate,
	// handler: timetravel,
	handler: (): void => {},
}, {
	icon: 'ti ti-settings',
	text: i18n.ts.settings,
	handler: settings,
}] : []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => list ? {
	title: list.name,
	icon: 'ti ti-list',
} : null));
</script>

<style lang="scss" scoped>
.eqqrhokj {
	padding: var(--margin);

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

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}

	&.min-width_800px {
		max-width: 800px;
		margin: 0 auto;
	}
}
</style>
