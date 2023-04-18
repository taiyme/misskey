<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	:with-ok-button="true"
	:ok-button-disabled="false"
	:can-close="false"
	@close="dialog?.close()"
	@closed="$emit('closed')"
	@ok="ok()"
>
	<template #header>{{ title || i18n.ts.generateAccessToken }}</template>
	<div v-if="information" class="_section">
		<MkInfo warn>{{ information }}</MkInfo>
	</div>
	<div class="_section">
		<MkInput v-model="name">
			<template #label>{{ i18n.ts.name }}</template>
		</MkInput>
	</div>
	<div class="_section">
		<div style="margin-bottom: 16px;"><b>{{ i18n.ts.permission }}</b></div>
		<MkButton inline @click="disableAll">{{ i18n.ts.disableAll }}</MkButton>
		<MkButton inline @click="enableAll">{{ i18n.ts.enableAll }}</MkButton>
		<MkSwitch v-for="kind in (initialPermissions || kinds)" :key="kind" v-model="permissions[kind]">{{ i18n.t(`_permissions.${kind}`) }}</MkSwitch>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { permissions as kinds } from 'misskey-js';
import MkInput from './form/input.vue';
import MkSwitch from './form/switch.vue';
import MkButton from './MkButton.vue';
import MkInfo from './MkInfo.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n';

const props = withDefaults(defineProps<{
	title?: string | null;
	information?: string | null;
	initialName?: string | null;
	initialPermissions?: string[] | null;
}>(), {
	title: null,
	information: null,
	initialName: null,
	initialPermissions: null,
});

const emit = defineEmits<{
	(ev: 'closed'): void;
	(ev: 'done', result: { name: string | null, permissions: string[] }): void;
}>();

const dialog = $ref<InstanceType<typeof MkModalWindow>>();
let name = $ref(props.initialName ?? '');
let permissions = $ref({} as Record<string, boolean>);

if (props.initialPermissions) {
	for (const kind of props.initialPermissions) {
		permissions[kind] = true;
	}
} else {
	for (const kind of kinds) {
		permissions[kind] = false;
	}
}

const ok = (): void => {
	emit('done', {
		name: name,
		permissions: Object.keys(permissions).filter(p => permissions[p]),
	});
	dialog?.close();
};

const disableAll = (): void => {
	for (const p in permissions) {
		permissions[p] = false;
	}
};

const enableAll = (): void => {
	for (const p in permissions) {
		permissions[p] = true;
	}
};
</script>
