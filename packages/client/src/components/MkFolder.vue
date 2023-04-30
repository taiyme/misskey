<template>
<div v-size="{ max: [500] }" class="ssazuxis">
	<header class="_button" :style="{ background: bg ?? undefined }" @click="showBody = !showBody">
		<div class="title"><slot name="header"></slot></div>
		<div class="divider"></div>
		<button class="_button">
			<template v-if="showBody"><i class="ti ti-chevron-up"></i></template>
			<template v-else><i class="ti ti-chevron-down"></i></template>
		</button>
	</header>
	<Transition
		:name="defaultStore.state.animation ? 'folder-toggle' : ''"
		@enter="enter"
		@after-enter="afterEnter"
		@leave="leave"
		@after-leave="afterLeave"
	>
		<div v-show="showBody">
			<slot></slot>
		</div>
	</Transition>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import tinycolor from 'tinycolor2';
import { defaultStore } from '@/store';

const localStoragePrefix = 'ui:folder:';

export default defineComponent({
	props: {
		expanded: {
			type: Boolean,
			required: false,
			default: true,
		},
		persistKey: {
			type: String,
			required: false,
			default: null,
		},
	},
	data(): ({
		bg: string | null;
		showBody: boolean;
		defaultStore: typeof defaultStore;
	}) {
		return {
			bg: null,
			showBody: (this.persistKey && localStorage.getItem(localStoragePrefix + this.persistKey)) ? localStorage.getItem(localStoragePrefix + this.persistKey) === 't' : this.expanded,
			defaultStore,
		};
	},
	watch: {
		showBody() {
			if (this.persistKey) {
				localStorage.setItem(localStoragePrefix + this.persistKey, this.showBody ? 't' : 'f');
			}
		},
	},
	mounted() {
		function getParentBg(el: HTMLElement | null): string {
			if (el == null || el.tagName === 'BODY') return 'var(--bg)';
			const bg = el.style.background || el.style.backgroundColor;
			if (bg) {
				return bg;
			} else {
				return getParentBg(el.parentElement);
			}
		}
		const rawBg = getParentBg(this.$el);
		const bg = tinycolor(rawBg.startsWith('var(') ? getComputedStyle(document.documentElement).getPropertyValue(rawBg.slice(4, -1)) : rawBg);
		bg.setAlpha(0.85);
		this.bg = bg.toRgbString();
	},
	methods: {
		toggleContent(show: boolean) {
			this.showBody = show;
		},
		enter(el: HTMLElement) {
			const { height: elementHeight } = el.getBoundingClientRect();
			el.style.height = '0';
			el.offsetHeight; // reflow
			el.style.height = `${elementHeight}px`;
		},
		afterEnter(el: HTMLElement) {
			el.style.height = '';
		},
		leave(el: HTMLElement) {
			const { height: elementHeight } = el.getBoundingClientRect();
			el.style.height = `${elementHeight}px`;
			el.offsetHeight; // reflow
			el.style.height = '0';
		},
		afterLeave(el: HTMLElement) {
			el.style.height = '';
		},
	},
});
</script>

<style lang="scss" scoped>
.folder-toggle-enter-active, .folder-toggle-leave-active {
	overflow-y: hidden; // fallback (overflow: clip)
	overflow-y: clip;
	transition: opacity 0.5s, height 0.5s !important;
}
.folder-toggle-enter-from {
	opacity: 0;
}
.folder-toggle-leave-to {
	opacity: 0;
}

.ssazuxis {
	position: relative;

	> header {
		display: flex;
		position: relative;
		z-index: 10;
		position: sticky;
		top: var(--stickyTop, 0px);
		padding: var(--x-padding);
		-webkit-backdrop-filter: var(--blur, blur(8px));
		backdrop-filter: var(--blur, blur(20px));

		> .title {
			margin: 0;
			padding: 12px 16px 12px 0;

			> i {
				margin-right: 6px;
			}

			&:empty {
				display: none;
			}
		}

		> .divider {
			flex: 1;
			margin: auto;
			height: 1px;
			background: var(--divider);
		}

		> button {
			padding: 12px 0 12px 16px;
		}
	}

	&.max-width_500px {
		> header {
			> .title {
				padding: 8px 10px 8px 0;
			}
		}
	}
}
</style>
