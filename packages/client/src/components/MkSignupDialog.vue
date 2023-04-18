<template>
<MkModalWindow
	ref="dialog"
	:width="366"
	:height="500"
	@close="dialog?.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.signup }}</template>

	<div class="_monolithic_">
		<div class="_section">
			<MkSignup :auto-set="autoSet" @signup="onSignup" @signup-email-pending="onSignupEmailPending"/>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkSignup from '@/components/MkSignup.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n';

withDefaults(defineProps<{
	autoSet?: boolean;
}>(), {
	autoSet: false,
});

const emit = defineEmits<{
	(ev: 'done', res: any): void;
	(ev: 'closed'): void;
}>();

const dialog = $ref<InstanceType<typeof MkModalWindow>>();

const onSignup = (res): void => {
	emit('done', res);
	dialog?.close();
};

const onSignupEmailPending = (): void => {
	dialog?.close();
};
</script>
