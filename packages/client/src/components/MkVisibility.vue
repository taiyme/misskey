<template>
<span v-if="note.visibility !== 'public'" :class="$style.visibility" :title="i18n.ts._visibility[note.visibility]">
	<i v-if="note.visibility === 'home'" class="ti ti-home"></i>
	<i v-else-if="note.visibility === 'followers'" class="ti ti-lock"></i>
	<i v-else-if="note.visibility === 'specified'" class="ti ti-mail" @click="showRecipients"></i>
</span>
<span v-if="note.localOnly" :class="$style.localOnly" :title="i18n.ts._visibility['localOnly']"><i class="ti ti-world-off"></i></span>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const props = defineProps<{
	note: {
		visibility: string;
		localOnly?: boolean;
		visibleUserIds?: string[];
	},
}>();

async function showRecipients(): Promise<void> {
	os.popup(defineAsyncComponent(() => import('@/components/MkUserIdsDialog.vue')), {
		title: i18n.ts.recipient,
		userIds: props.note.visibleUserIds ?? [],
	}, {}, 'closed');
}
</script>

<style lang="scss" module>
.visibility, .localOnly {
	margin-left: 0.5em;
}
</style>
