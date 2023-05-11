<template>
<MkA :to="`/clips/${clip.id}`" :class="[$style.root, '_block']" tabindex="-1">
	<div :class="$style.clipName">{{ clip.name }}</div>
	<div v-if="clip.description" :class="$style.clipDescription">{{ clip.description.length > 85 ? `${clip.description.slice(0, 85)}…` : clip.description }}</div>
	<div :class="$style.clipUser">
		<MkAvatar :class="$style.clipUserIcon" :user="clip.user" disable-link disable-preview/>
		<MkUserName :class="$style.clipUserName" :user="clip.user" nowrap/>
	</div>
</MkA>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as Misskey from 'misskey-js';

defineProps<{
	// clip: Misskey.entities.Clip;
	clip: {
		id: string;
		createdAt: string;
		userId: string;
		user: Misskey.entities.UserLite;
		name: string;
		description: string | null;
		isPublic: boolean;
	};
}>();
</script>

<style lang="scss" module>
.root {
	display: block;
	padding: 16px;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	color: inherit !important;

	&:hover {
		text-decoration: none;
		color: var(--accent);
	}
}

.clipName {
	font-weight: bold;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.clipDescription {
	margin-top: 8px;
	font-size: 0.8em;
}

.clipUser {
	margin-top: 8px;
	display: grid;
	grid-template-columns: 16px 1fr;
	grid-template-rows: 16px;
}

.clipUserIcon {
	display: block !important;
	width: 100% !important;
	height: 100% !important;
}

.clipUserName {
	font-size: 0.8em;
	line-height: 0.8em;
}
</style>
