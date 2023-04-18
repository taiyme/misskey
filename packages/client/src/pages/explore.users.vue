<template>
<MkSpacer :content-max="1200">
	<MkTab v-model="origin" style="margin-bottom: var(--margin);">
		<option value="local">{{ i18n.ts.local }}</option>
		<option value="remote">{{ i18n.ts.remote }}</option>
	</MkTab>
	<div v-if="origin === 'local'">
		<template v-if="tag == null">
			<MkFolder class="_gap" persist-key="explore-pinned-users">
				<template #header><i class="ti ti-bookmark ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.pinnedUsers }}</template>
				<MkUserList :pagination="pinnedUsers"/>
			</MkFolder>
			<MkFolder class="_gap" persist-key="explore-popular-users">
				<template #header><i class="ti ti-chart-line ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.popularUsers }}</template>
				<MkUserList :pagination="popularUsers"/>
			</MkFolder>
			<MkFolder class="_gap" persist-key="explore-recently-updated-users">
				<template #header><i class="ti ti-message ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.recentlyUpdatedUsers }}</template>
				<MkUserList :pagination="recentlyUpdatedUsers"/>
			</MkFolder>
			<MkFolder class="_gap" persist-key="explore-recently-registered-users">
				<template #header><i class="ti ti-plus ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.recentlyRegisteredUsers }}</template>
				<MkUserList :pagination="recentlyRegisteredUsers"/>
			</MkFolder>
		</template>
	</div>
	<div v-else>
		<MkFolder ref="tagsEl" :foldable="true" :expanded="false" class="_gap">
			<template #header><i class="ti ti-hash ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.popularTags }}</template>

			<div class="vxjfqztj">
				<MkA v-for="tagLocal in tagsLocal" :key="`local:${tagLocal.tag}`" :to="`/explore/tags/${tagLocal.tag}`" class="local">{{ tagLocal.tag }}</MkA>
				<MkA v-for="tagRemote in tagsRemote" :key="`remote:${tagRemote.tag}`" :to="`/explore/tags/${tagRemote.tag}`">{{ tagRemote.tag }}</MkA>
			</div>
		</MkFolder>

		<MkFolder v-if="tag != null" :key="`${tag}`" class="_gap">
			<template #header><i class="ti ti-hash ti-fw" style="margin-right: 0.5em;"></i>{{ tag }}</template>
			<MkUserList :pagination="tagUsers"/>
		</MkFolder>

		<template v-if="tag == null">
			<MkFolder class="_gap">
				<template #header><i class="ti ti-chart-line ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.popularUsers }}</template>
				<MkUserList :pagination="popularUsersF"/>
			</MkFolder>
			<MkFolder class="_gap">
				<template #header><i class="ti ti-message ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.recentlyUpdatedUsers }}</template>
				<MkUserList :pagination="recentlyUpdatedUsersF"/>
			</MkFolder>
			<MkFolder class="_gap">
				<template #header><i class="ti ti-rocket ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.recentlyDiscoveredUsers }}</template>
				<MkUserList :pagination="recentlyRegisteredUsersF"/>
			</MkFolder>
		</template>
	</div>
</MkSpacer>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import MkUserList from '@/components/MkUserList.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkTab from '@/components/MkTab.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const props = defineProps<{
	tag?: string;
}>();

let origin = $ref('local');
let tagsEl = $ref<InstanceType<typeof MkFolder>>();

let tagsLocal = $ref<{ tag: string; }[]>([]);
let tagsRemote = $ref<{ tag: string; }[]>([]);

watch(() => props.tag, () => {
	if (tagsEl) tagsEl.toggleContent(props.tag == null);
});

const tagUsers = $computed(() => ({
	endpoint: 'hashtags/users' as const,
	limit: 30,
	params: {
		tag: props.tag,
		origin: 'combined',
		sort: '+follower',
	},
}));

const pinnedUsers = {
	endpoint: 'pinned-users' as const,
	limit: 10,
};

const popularUsers = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		state: 'alive',
		origin: 'local',
		sort: '+follower',
	},
};

const recentlyUpdatedUsers = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		origin: 'local',
		sort: '+updatedAt',
	},
};

const recentlyRegisteredUsers = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		origin: 'local',
		state: 'alive',
		sort: '+createdAt',
	},
};

const popularUsersF = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		state: 'alive',
		origin: 'remote',
		sort: '+follower',
	},
};

const recentlyUpdatedUsersF = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		origin: 'combined',
		sort: '+updatedAt',
	},
};

const recentlyRegisteredUsersF = {
	endpoint: 'users' as const,
	limit: 10,
	noPaging: true,
	params: {
		origin: 'combined',
		sort: '+createdAt',
	},
};

os.api('hashtags/list', {
	sort: '+attachedLocalUsers',
	attachedToLocalUserOnly: true,
	limit: 30,
}).then(tags => {
	tagsLocal = tags as { tag: string; }[];
});

os.api('hashtags/list', {
	sort: '+attachedRemoteUsers',
	attachedToRemoteUserOnly: true,
	limit: 30,
}).then(tags => {
	tagsRemote = tags as { tag: string; }[];
});
</script>

<style lang="scss" scoped>
.vxjfqztj {
	> * {
		margin-right: 16px;

		&.local {
			font-weight: bold;
		}
	}
}
</style>
