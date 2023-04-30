<template>
<div v-size="{ min: [350, 500] }" class="fefdfafb" :class="$style.root">
	<MkAvatar :class="$style.avatar" :user="$i"/>
	<div :class="$style.main">
		<div :class="$style.header">
			<MkUserName :user="$i" :nowrap="true"/>
		</div>
		<div>
			<div :class="$style.content">
				<Mfm :text="text.trim()" :author="$i" :i="$i"/>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { $i } from '@/account';

defineProps<{
	text: string;
}>();
</script>

<style lang="scss" module>
.root {
	display: flex;
	margin: 0;
	padding: 0;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	font-size: 0.95em;
}

.avatar {
	flex-shrink: 0 !important;
	display: block !important;
	margin: 0 10px 0 0 !important;
	width: 40px !important;
	height: 40px !important;
	border-radius: 8px !important;
	pointer-events: none !important;
}

.main {
	flex: 1;
	min-width: 0;
}

.header {
	margin-bottom: 2px;
	font-weight: bold;
	width: 100%;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	text-overflow: ellipsis;
}

:global(.min-width_350px) {
	.avatar {
		margin: 0 10px 0 0 !important;
		width: 44px !important;
		height: 44px !important;
	}
}

:global(.min-width_500px) {
	.avatar {
		margin: 0 12px 0 0 !important;
		width: 48px !important;
		height: 48px !important;
	}
}
</style>
