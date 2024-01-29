<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-panel
	:class="$style.root"
	:style="{ backgroundImage: props.bannerUrl != null ? `url(${ props.bannerUrl })` : undefined }"
>
	<div
		:class="['_gaps_m', $style.container, { [$style.overlay]: props.bannerUrl != null }]"
	>
		<img :class="$style.icon" :src="props.iconUrl" :alt="props.serverName"/>
		<div :class="[$style.name, { [$style.onOverlay]: props.bannerUrl != null }]">
			<b>{{ props.serverName }}</b>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	serverName: string;
	iconUrl: string;
	bannerUrl?: string | null;
}>();
</script>

<style lang="scss" module>
.root {
	text-align: center;
	border-radius: 10px;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	background-size: cover;
	background-position: center center;
}

.container {
	padding: 16px;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;

	&.overlay {
		background-color: rgba(0, 0, 0, 0.5);
	}
}

.icon {
	display: block;
	margin: 0 auto;
	height: 64px;
	border-radius: 8px;
}

.name {
	display: block;
	color: var(--fg);

	&.onOverlay {
		color: #fff;
		text-shadow: 0 0 8px #000;
	}
}
</style>
