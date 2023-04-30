<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkSpacer :content-max="700">
	<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
		<div :class="$style.reactions">
			<div v-for="item in items" :key="item.id" :class="[$style.reaction, '_panel']">
				<div :class="$style.header">
					<MkAvatar :class="$style.avatar" :user="user"/>
					<MkReactionIcon :class="$style.reactionIcon" :reaction="item.type" :custom-emojis="item.note.emojis" :no-style="true"/>
					<MkTime :time="item.createdAt" :class="$style.createdAt"/>
				</div>
				<MkNote :key="item.id" :note="item.note"/>
			</div>
		</div>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as misskey from 'misskey-js';
import MkPagination from '@/components/MkPagination.vue';
import MkNote from '@/components/MkNote.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';

const props = defineProps<{
	user: misskey.entities.User;
}>();

const pagination = {
	endpoint: 'users/reactions' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" module>
.reactions {
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: 100%;
	gap: var(--margin);
}

.header {
	display: flex;
	align-items: center;
	padding: 8px 16px;
	margin-bottom: 8px;
	border-bottom: solid 0.5px var(--divider);
}

.avatar {
	width: 24px !important;
	height: 24px !important;
	margin-right: 8px;
}

.reactionIcon {
	width: 32px !important;
	height: 32px !important;
	margin-right: 4px;
}

.createdAt {
	margin-left: auto;
	font-size: 0.9em;
}
</style>
