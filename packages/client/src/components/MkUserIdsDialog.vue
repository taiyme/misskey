<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	@close="dialog.close()"
	@closed="emit('closed')"
>
	<template #header>{{ title }}</template>

	<MkSpacer :margin-min="20" :margin-max="28">
		<div class="mk-visible-users-dialog _gaps">
			<div v-if="users.length === 0" class="_fullinfo">
				<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
				<div>{{ i18n.ts.nothing }}</div>
			</div>
			<template v-else>
				<MkA v-for="user in users" :key="user.id" :to="userPage(user)">
					<MkUserCardMini class="user" :user="user" :with-chart="false"/>
				</MkA>
			</template>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'misskey-js';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import { userPage } from '@/filters/user';
import { i18n } from '@/i18n';
import * as os from '@/os';

const emit = defineEmits<{
	(ev: 'closed'): void,
}>();

const props = defineProps<{
	title: string;
	userIds: misskey.entities.User['id'][];
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

let users = $ref<misskey.entities.UserDetailed[]>([]);

os.api('users/show', {
	userIds: props.userIds,
}).then(_users => {
	users = _users;
});
</script>
