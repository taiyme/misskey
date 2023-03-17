<template>
<XModalWindow
	ref="dialog"
	:width="366"
	:height="500"
	@close="dialog?.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.signup }}</template>

	<div class="_monolithic_">
		<div class="_section">
			<XSignup :auto-set="autoSet" @signup="onSignup" @signup-email-pending="onSignupEmailPending"/>
		</div>
	</div>
</XModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XSignup from '@/components/MkSignup.vue';
import XModalWindow from '@/components/MkModalWindow.vue';
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

const dialog = $ref<InstanceType<typeof XModalWindow>>();

const onSignup = (res): void => {
	emit('done', res);
	dialog?.close();
};

const onSignupEmailPending = (): void => {
	dialog?.close();
};
</script>
