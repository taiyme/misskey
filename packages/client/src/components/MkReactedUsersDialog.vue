<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	@click="dialog?.close()"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.reactions }}</template>

	<MkSpacer :margin-min="20" :margin-max="28">
		<div v-if="note" class="mk-reacted-users-dialog _gaps">
			<div v-if="!hasRenote && reactions?.length === 0" class="_fullinfo">
				<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
				<div>{{ i18n.ts.nothing }}</div>
			</div>
			<template v-else>
				<div class="tabs">
					<button v-if="hasRenote" class="tab _button" :class="{ tabActive: tab === RENOTE_TAB }" @click="tab = RENOTE_TAB">
						<i class="ti ti-repeat"></i>
						<span style="margin-left: 4px;">{{ note.renoteCount }}</span>
					</button>
					<button v-for="reaction in reactions" :key="reaction" class="tab _button" :class="{ tabActive: tab === reaction }" @click="tab = reaction">
						<MkReactionIcon :reaction="reaction" :custom-emojis="note.emojis"/>
						<span style="margin-left: 4px;">{{ note.reactions[reaction] }}</span>
					</button>
				</div>
				<div class="users">
					<TmsUserCardMiniList v-if="tab === RENOTE_TAB" :pagination="renotedUsers" :with-chart="false" :use-user-page="true"/>
					<TmsUserCardMiniList v-else :pagination="reactedUsers" :with-chart="false" :use-user-page="true"/>
				</div>
			</template>
		</div>
		<div v-else>
			<MkLoading/>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import TmsUserCardMiniList from '@/components/TmsUserCardMiniList.vue';
import { i18n } from '@/i18n';
import * as os from '@/os';

const emit = defineEmits<{
	(ev: 'closed'): void,
}>();

const props = defineProps<{
	noteId: Misskey.entities.Note['id'];
	initialTab?: string | null;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

const RENOTE_TAB = 'RENOTE_TAB';
let hasRenote = $ref<boolean>(false);

let note = $ref<Misskey.entities.Note>();
let tab = $ref<typeof RENOTE_TAB | string>();
let reactions = $ref<string[]>();

const renotedUsers = {
	endpoint: 'notes/renotes' as const,
	limit: 30,
	params: {
		noteId: props.noteId,
	},
};

const reactedUsers = {
	endpoint: 'notes/reactions' as const,
	limit: 30,
	params: computed(() => ({
		noteId: props.noteId,
		type: tab,
	})),
	offsetMode: true,
};

onMounted(() => {
	os.api('notes/show', {
		noteId: props.noteId,
	}).then((res) => {
		hasRenote = res.renoteCount > 0;
		reactions = Object.keys(res.reactions);
		if (typeof props.initialTab === 'string') {
			tab = props.initialTab;
		} else if (hasRenote && props.initialTab === null) {
			tab = RENOTE_TAB;
		} else {
			tab = hasRenote ? RENOTE_TAB : reactions[0];
		}
		note = res;
	});
});
</script>

<style lang="scss" scoped>
.mk-reacted-users-dialog {
	.tabs {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;

		.tab {
			padding: 4px 6px;
			border: solid 1px var(--divider);
			border-radius: 6px;

			&.tabActive {
				border-color: var(--accent);
			}
		}
	}
}
</style>
