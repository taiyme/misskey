<template>
<div v-if="show" ref="el" class="fdidabkb" :style="{ background: bg }">
	<div class="upper" :class="{ slim: narrow, thin: thin_ }">
		<div v-if="!thin_ && narrow && props.displayMyAvatar && $i" class="_button buttons left" @click="openAccountMenu">
			<MkAvatar class="avatar" :user="$i" :disable-preview="true"/>
		</div>
		<div v-else-if="!thin_ && narrow && !hideTitle" class="buttons left"></div>

		<template v-if="metadata">
			<div v-if="!hideTitle" class="titleContainer" @click="top">
				<MkAvatar v-if="metadata.avatar" class="avatar" :user="metadata.avatar" :disable-preview="true" :show-indicator="true"/>
				<i v-else-if="metadata.icon" class="icon" :class="metadata.icon"></i>

				<div class="title">
					<MkUserName v-if="metadata.userName" :user="metadata.userName" :nowrap="true"/>
					<div v-else-if="metadata.title">{{ metadata.title }}</div>
					<div v-if="metadata.subtitle" class="subtitle">
						{{ metadata.subtitle }}
					</div>
				</div>
			</div>
			<XTabs v-if="!narrow || hideTitle" class="tabs" :tab="tab" :tabs="tabs" :root-el="el" @update:tab="key => emit('update:tab', key)" @tab-click="onTabClick"/>
		</template>
		<div v-if="(!thin_ && narrow && !hideTitle) || (actions && actions.length > 0)" class="buttons right">
			<template v-for="action in actions">
				<button v-tooltip.noDelay="action.text" class="_button button" :class="{ highlighted: action.highlighted }" @click.stop="action.handler" @touchstart="preventDrag"><i :class="action.icon"></i></button>
			</template>
		</div>
	</div>
	<div v-if="(narrow && !hideTitle) && hasTabs" class="lower" :class="{ slim: narrow, thin: thin_ }">
		<XTabs class="tabs" :tab="tab" :tabs="tabs" :root-el="el" @update:tab="key => emit('update:tab', key)" @tab-click="onTabClick"/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, inject } from 'vue';
import tinycolor from 'tinycolor2';
import XTabs, { Tab } from './MkPageHeader.tabs.vue';
import { scrollToTop } from '@/scripts/scroll';
import { globalEvents } from '@/events';
import { injectPageMetadata } from '@/scripts/page-metadata';
import { $i, openAccountMenu as openAccountMenu_ } from '@/account';

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	tab?: string;
	actions?: {
		text: string;
		icon: string;
		highlighted?: boolean;
		handler: (ev: MouseEvent) => void;
	}[];
	thin?: boolean;
	displayMyAvatar?: boolean;
}>(), {
	tabs: () => ([] as Tab[]),
});

const emit = defineEmits<{
	(ev: 'update:tab', key: string);
}>();

const metadata = injectPageMetadata();

const hideTitle = inject('shouldOmitHeaderTitle', false);
const thin_ = props.thin || inject('shouldHeaderThin', false);

let el = $shallowRef<HTMLElement | undefined>(undefined);
const bg = ref<string | undefined>(undefined);
let narrow = $ref(false);
const hasTabs = $computed(() => props.tabs.length > 0);
const hasActions = $computed(() => props.actions && props.actions.length > 0);
const show = $computed(() => {
	return !hideTitle || hasTabs || hasActions;
});

const preventDrag = (ev: TouchEvent) => {
	ev.stopPropagation();
};

const top = () => {
	if (el) {
		scrollToTop(el as HTMLElement, { behavior: 'smooth' });
	}
};

function openAccountMenu(ev: MouseEvent) {
	openAccountMenu_({
		withExtraOperation: true,
	}, ev);
}

function onTabClick(): void {
	top();
}

const calcBg = () => {
	const rawBg = 'var(--bg)';
	const tinyBg = tinycolor(rawBg.startsWith('var(') ? getComputedStyle(document.documentElement).getPropertyValue(rawBg.slice(4, -1)) : rawBg);
	tinyBg.setAlpha(0.85);
	bg.value = tinyBg.toRgbString();
};

let ro: ResizeObserver | null;

onMounted(() => {
	calcBg();
	globalEvents.on('themeChanged', calcBg);

	if (el && el.parentElement) {
		narrow = el.parentElement.offsetWidth < 500;
		ro = new ResizeObserver((entries, observer) => {
			if (el && el.parentElement && document.body.contains(el as HTMLElement)) {
				narrow = el.parentElement.offsetWidth < 500;
			}
		});
		ro.observe(el.parentElement as HTMLElement);
	}
});

onUnmounted(() => {
	globalEvents.off('themeChanged', calcBg);
	if (ro) ro.disconnect();
});
</script>

<style lang="scss" scoped>
.fdidabkb {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	border-bottom: solid 0.5px var(--divider);
	width: 100%;

	> .upper {
		--height: 50px;
		width: 100%;
		display: flex;
		gap: var(--margin);
		height: var(--height);
		background: transparent;

		> .tabs:first-child {
			margin-left: auto;
			padding: 0 12px;
		}

		> .tabs {
			margin-right: auto;
		}

		&.thin {
			--height: 42px;

			> .buttons {
				> .button {
					font-size: 0.9em;
				}
			}
		}

		&.slim {
			text-align: center;
			gap: 0;

			> .tabs:first-child {
				margin-left: 0;
			}

			> .titleContainer {
				margin: 0 auto;
				max-width: 100%;
			}
		}

		> .buttons {
			--margin: 8px;
			display: flex;
			align-items: center;
			min-width: var(--height);
			height: var(--height);

			&:empty {
				width: var(--height);
			}

			&.left {
				margin: 0 var(--margin) 0 0;

				> .avatar {
					$size: 32px;
					display: inline-block;
					width: $size;
					height: $size;
					vertical-align: bottom;
					margin: 0 8px;
				}
			}

			&.right {
				margin: 0 0 0 var(--margin);
			}

			> .button {
				display: flex;
				align-items: center;
				justify-content: center;
				height: var(--height);
				width: calc(var(--height) - (var(--margin)));
				box-sizing: border-box;
				position: relative;
				border-radius: 5px;

				&:hover {
					background: rgba(0, 0, 0, 0.05);
				}

				&.highlighted {
					color: var(--accent);
				}
			}

			.fullButton {
				& + .fullButton {
					margin-left: 12px;
				}
			}
		}

		> .titleContainer {
			display: flex;
			align-items: center;
			max-width: min(30vw, 400px);
			overflow: auto;
			white-space: nowrap;
			text-align: left;
			font-weight: bold;
			flex-shrink: 1;
			margin-left: 24px;

			> .avatar {
				$size: 32px;
				display: inline-block;
				width: $size;
				height: $size;
				vertical-align: bottom;
				margin: 0 8px;
				pointer-events: none;
			}

			> .icon {
				margin-right: 8px;
				width: 16px;
				text-align: center;
			}

			> .title {
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				line-height: 1.1;

				> .subtitle {
					opacity: 0.6;
					font-size: 0.8em;
					font-weight: normal;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;

					&.activeTab {
						text-align: center;

						> .chevron {
							display: inline-block;
							margin-left: 6px;
						}
					}
				}
			}
		}
	}

	> .lower {
		--height: 40px;
		width: 100%;
		height: var(--height);
		background: transparent;
	}
}
</style>
