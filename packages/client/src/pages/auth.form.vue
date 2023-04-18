<template>
<section class="_section">
	<div class="_title">{{ i18n.t('_auth.shareAccess', { name: app.name }) }}</div>
	<div class="_content">
		<h2>{{ app.name }}</h2>
		<p class="id">{{ app.id }}</p>
		<p class="description">{{ app.description }}</p>
	</div>
	<div class="_content">
		<h2>{{ i18n.ts._auth.permissionAsk }}</h2>
		<ul>
			<li v-for="p in app.permission" :key="p">{{ i18n.t(`_permissions.${p}`) }}</li>
		</ul>
	</div>
	<div class="_footer">
		<MkButton inline @click="cancel">{{ i18n.ts.cancel }}</MkButton>
		<MkButton inline primary @click="accept">{{ i18n.ts.accept }}</MkButton>
	</div>
</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

export default defineComponent({
	components: {
		MkButton,
	},

	props: ['session'],

	emits: ['denied', 'accepted'],

	data() {
		return {
			i18n,
		};
	},

	computed: {
		name(): string {
			const el = document.createElement('div');
			el.textContent = this.app.name;
			return el.innerHTML;
		},
		app(): any {
			return this.session.app;
		},
	},

	methods: {
		cancel() {
			os.api('auth/deny', {
				token: this.session.token,
			}).then(() => {
				this.$emit('denied');
			});
		},

		accept() {
			os.api('auth/accept', {
				token: this.session.token,
			}).then(() => {
				this.$emit('accepted');
			});
		},
	},
});
</script>
