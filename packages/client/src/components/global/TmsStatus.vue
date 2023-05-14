<template>
<Transition :name="defaultStore.state.animation ? 'zoom' : ''" appear>
	<div :class="$style.root">
		<img v-if="imageUrl" :src="imageUrl" :class="[$style.image, '_ghost']"/>
		<div :class="$style.description">
			<slot>
				<i class="ti ti-alert-triangle"></i> {{ i18n.ts.somethingHappened }}
			</slot>
		</div>
		<MkButton v-if="retry" @click="retry">{{ i18n.ts.retry }}</MkButton>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { match } from 'ts-pattern';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import customImage from '@/tms/custom-image';

const props = defineProps<{ type: 'info' | 'notfound' | 'error'; retry?: () => void; }>();

const imageUrl = computed(() => match(props.type)
	.with('info', () => customImage.infoImageURL)
	.with('notfound', () => customImage.notFoundImageURL)
	.with('error', () => customImage.errorImageURL)
	.exhaustive(),
);
</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
	gap: var(--margin);
	padding: 32px;
	text-align: center;
	align-items: center;
}

.image {
	display: inline-block;
	height: 128px;
	border-radius: 16px;
	vertical-align: bottom;
}
</style>
