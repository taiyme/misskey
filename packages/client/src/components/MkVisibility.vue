<template>
<span v-if="note.visibility !== 'public'" :class="$style.visibility" :title="i18n.ts._visibility[note.visibility]">
	<i v-if="note.visibility === 'home'" class="ti ti-home"></i>
	<i v-else-if="note.visibility === 'followers'" class="ti ti-lock"></i>
	<i v-else-if="note.visibility === 'specified'" class="ti ti-mail" @click="showRecipients"></i>
</span>
<span v-if="note.localOnly" :class="$style.localOnly" :title="i18n.ts._visibility.disableFederation"><i class="ti ti-world-off"></i></span>
<span v-if="hasAuthority" :class="$style.hasAuthority"><i class="ti ti-eye-check"></i></span>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { $i } from '@/account';

const props = defineProps<{
	note: misskey.entities.Note;
}>();

let hasAuthority = $ref(false);

if ($i && $i.id !== props.note.userId && $i.isAdmin) {
	if (props.note.visibility === 'followers') {
		os.api('users/show', {
			userId: props.note.userId,
		}).then(user => {
			hasAuthority = !user.isFollowing;
		});
	}
	if (props.note.visibility === 'specified' && props.note.visibleUserIds) {
		hasAuthority = !props.note.visibleUserIds.includes($i.id);
	}
}

async function showRecipients(): Promise<void> {
	os.popup(defineAsyncComponent(() => import('@/components/MkUserIdsDialog.vue')), {
		title: i18n.ts.recipient,
		userIds: props.note.visibleUserIds ?? [],
	}, {}, 'closed');
}
</script>

<style lang="scss" module>
.visibility, .localOnly, .hasAuthority {
	margin-left: 0.5em;
}
</style>
