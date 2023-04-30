<template>
<!-- sectionを利用しているのは、deck.vue側でcolumnに対してfirst-of-typeを効かせるため -->
<section
	v-hotkey="keymap" class="dnpfarvg _narrow_"
	:class="{ paged: isMainColumn, naked, active, isStacked, draghover, dragging, dropready }"
	@dragover.prevent.stop="onDragover"
	@dragleave="onDragleave"
	@drop.prevent.stop="onDrop"
>
	<header
		:class="{ indicated }"
		draggable="true"
		@click="goTop"
		@dragstart="onDragstart"
		@dragend="onDragend"
		@contextmenu.prevent.stop="onContextmenu"
	>
		<button v-if="isStacked && !isMainColumn" class="toggleActive _button" @click="toggleActive">
			<template v-if="active"><i class="ti ti-chevron-up"></i></template>
			<template v-else><i class="ti ti-chevron-down"></i></template>
		</button>
		<div class="action">
			<slot name="action"></slot>
		</div>
		<span class="header"><slot name="header"></slot></span>
		<button v-tooltip="i18n.ts.reload" class="reload _button" @click.stop="reload"><i class="ti ti-reload"></i></button>
		<button v-tooltip="i18n.ts.settings" class="menu _button" @click.stop="showSettingsMenu"><i class="ti ti-dots"></i></button>
	</header>
	<div v-show="active" :key="`${column.id}:${reloadCount}`" ref="body">
		<slot></slot>
	</div>
</section>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, provide, watch } from 'vue';
import { updateColumn, swapLeftColumn, swapRightColumn, swapUpColumn, swapDownColumn, stackLeftColumn, popRightColumn, removeColumn, swapColumn, Column } from './deck-store';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { disableContextmenu } from '@/scripts/touch';
import { MenuItem } from '@/types/menu';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';

provide('shouldHeaderThin', true);
provide('shouldOmitHeaderTitle', true);
provide('shouldSpacerMin', true);

const props = withDefaults(defineProps<{
	column: Column;
	isStacked?: boolean;
	naked?: boolean;
	indicated?: boolean;
	menu?: MenuItem[];
}>(), {
	isStacked: false,
	naked: false,
	indicated: false,
	menu: () => [],
});

const emit = defineEmits<{
	(ev: 'parent-focus', direction: 'up' | 'down' | 'left' | 'right'): void;
	(ev: 'change-active-state', v: boolean): void;
}>();

let body = $ref<HTMLDivElement>();

let dragging = $ref(false);
watch($$(dragging), v => os.deckGlobalEvents.emit(v ? 'column.dragStart' : 'column.dragEnd'));

let draghover = $ref(false);
let dropready = $ref(false);

let reloadCount = $ref(0);

const isMainColumn = $computed(() => props.column.type === 'main');
const active = $computed(() => props.column.active !== false);
watch($$(active), v => emit('change-active-state', v));

const keymap = $computed(() => ({
	'shift+up': (): void => emit('parent-focus', 'up'),
	'shift+down': (): void => emit('parent-focus', 'down'),
	'shift+left': (): void => emit('parent-focus', 'left'),
	'shift+right': (): void => emit('parent-focus', 'right'),
}));

onMounted(() => {
	os.deckGlobalEvents.on('column.dragStart', onOtherDragStart);
	os.deckGlobalEvents.on('column.dragEnd', onOtherDragEnd);
});

onBeforeUnmount(() => {
	os.deckGlobalEvents.off('column.dragStart', onOtherDragStart);
	os.deckGlobalEvents.off('column.dragEnd', onOtherDragEnd);
});

const reload = (): void => {
	reloadCount++;
};

const onOtherDragStart = (): void => {
	dropready = true;
};

const onOtherDragEnd = (): void => {
	dropready = false;
};

const toggleActive = (): void => {
	if (!props.isStacked) return;
	updateColumn(props.column.id, {
		active: !props.column.active,
	});
};

const getMenu = (): MenuItem[] => {
	let items: MenuItem[] = [{
		icon: 'ti ti-settings',
		text: i18n.ts._deck.configureColumn,
		action: async (): Promise<void> => {
			const { canceled, result } = await os.form(props.column.name ?? '', {
				name: {
					type: 'string' as const,
					label: i18n.ts.name,
					default: props.column.name,
				},
				width: {
					type: 'number' as const,
					label: i18n.ts.width,
					default: props.column.width,
				},
				flexible: {
					type: 'boolean' as const,
					label: i18n.ts.flexible,
					default: props.column.flexible,
				},
			});
			if (canceled) return;
			updateColumn(props.column.id, result);
		},
	}, {
		type: 'parent',
		text: i18n.ts.move + '...',
		icon: 'ti ti-arrows-move',
		children: [{
			icon: 'ti ti-arrow-left',
			text: i18n.ts._deck.swapLeft,
			action: (): void => {
				swapLeftColumn(props.column.id);
			},
		}, {
			icon: 'ti ti-arrow-right',
			text: i18n.ts._deck.swapRight,
			action: (): void => {
				swapRightColumn(props.column.id);
			},
		}, props.isStacked ? {
			icon: 'ti ti-arrow-up',
			text: i18n.ts._deck.swapUp,
			action: (): void => {
				swapUpColumn(props.column.id);
			},
		} : undefined, props.isStacked ? {
			icon: 'ti ti-arrow-down',
			text: i18n.ts._deck.swapDown,
			action: (): void => {
				swapDownColumn(props.column.id);
			},
		} : undefined],
	}, {
		icon: 'ti ti-stack-2',
		text: i18n.ts._deck.stackLeft,
		action: (): void => {
			stackLeftColumn(props.column.id);
		},
	}, props.isStacked ? {
		icon: 'ti ti-window-maximize',
		text: i18n.ts._deck.popRight,
		action: (): void => {
			popRightColumn(props.column.id);
		},
	} : undefined, null, {
		icon: 'ti ti-trash',
		text: i18n.ts.remove,
		danger: true,
		action: (): void => {
			removeColumn(props.column.id);
		},
	}];

	if (props.menu.length !== 0) {
		items = [...props.menu, null, ...items];
	}

	return items;
};

const showSettingsMenu = (ev: MouseEvent): void => {
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	os.popupMenu(getMenu(), el);
};

const onContextmenu = (ev: MouseEvent): void => {
	if (disableContextmenu) return;
	os.contextMenu(getMenu(), ev);
};

const goTop = (): void => {
	body?.scrollTo({
		top: 0,
		behavior: 'smooth',
	});
};

const onDragstart = (ev: DragEvent): void => {
	if (!ev.dataTransfer) return;

	ev.dataTransfer.effectAllowed = 'move';
	ev.dataTransfer.setData(_DATA_TRANSFER_DECK_COLUMN_, props.column.id);

	// Chromeのバグで、Dragstartハンドラ内ですぐにDOMを変更する(=リアクティブなプロパティを変更する)とDragが終了してしまう
	// SEE: https://stackoverflow.com/questions/19639969/html5-dragend-event-firing-immediately
	window.setTimeout((): void => {
		dragging = true;
	}, 10);
};

const onDragend = (_ev: DragEvent): void => {
	dragging = false;
};

const onDragover = (ev: DragEvent): void => {
	if (!ev.dataTransfer) return;

	// 自分自身がドラッグされている場合
	if (dragging) {
		// 自分自身にはドロップさせない
		ev.dataTransfer.dropEffect = 'none';
	} else {
		const isDeckColumn = ev.dataTransfer.types[0] === _DATA_TRANSFER_DECK_COLUMN_;

		ev.dataTransfer.dropEffect = isDeckColumn ? 'move' : 'none';

		if (isDeckColumn) draghover = true;
	}
};

const onDragleave = (): void => {
	draghover = false;
};

const onDrop = (ev: DragEvent): void => {
	if (!ev.dataTransfer) return;

	draghover = false;
	os.deckGlobalEvents.emit('column.dragEnd');

	const id = ev.dataTransfer.getData(_DATA_TRANSFER_DECK_COLUMN_);
	if (id) {
		swapColumn(props.column.id, id);
	}
};
</script>

<style lang="scss" scoped>
.dnpfarvg {
	--root-margin: 10px;
	--deckColumnHeaderHeight: 42px;

	height: 100%;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	contain: strict;

	&.draghover {
		&:after {
			content: "";
			display: block;
			position: absolute;
			z-index: 1000;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: var(--focus);
		}
	}

	&.dragging {
		&:after {
			content: "";
			display: block;
			position: absolute;
			z-index: 1000;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: var(--focus);
			opacity: 0.5;
		}
	}

	&.dropready {
		* {
			pointer-events: none;
		}
	}

	&:not(.active) {
		flex-basis: var(--deckColumnHeaderHeight);
		min-height: var(--deckColumnHeaderHeight);

		> header.indicated {
			box-shadow: 4px 0px var(--accent) inset;
		}
	}

	&.naked {
		background: var(--acrylicBg) !important;
		-webkit-backdrop-filter: var(--blur, blur(10px));
		backdrop-filter: var(--blur, blur(10px));

		> header {
			background: transparent;
			box-shadow: none;

			> button {
				color: var(--fg);
			}
		}
	}

	&.paged {
		background: var(--bg) !important;
	}

	> header {
		position: relative;
		display: flex;
		z-index: 2;
		line-height: var(--deckColumnHeaderHeight);
		height: var(--deckColumnHeaderHeight);
		padding: 0 16px;
		font-size: 0.9em;
		color: var(--panelHeaderFg);
		background: var(--panelHeaderBg);
		box-shadow: 0 1px 0 0 var(--panelHeaderDivider);
		cursor: pointer;

		&, * {
			user-select: none;
		}

		&.indicated {
			box-shadow: 0 3px 0 0 var(--accent);
		}

		> .header {
			display: inline-block;
			align-items: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		> span:only-of-type {
			width: 100%;
		}

		> .toggleActive,
		> .action > ::v-deep(*),
		> .reload,
		> .menu {
			z-index: 1;
			width: var(--deckColumnHeaderHeight);
			line-height: var(--deckColumnHeaderHeight);
			color: var(--faceTextButton);

			&:hover {
				color: var(--faceTextButtonHover);
			}

			&:active {
				color: var(--faceTextButtonActive);
			}
		}

		> .toggleActive, > .action {
			margin-left: -16px;
		}

		> .action {
			z-index: 1;
		}

		> .action:empty {
			display: none;
		}

		> .reload {
			margin-left: auto;
			margin-right: 0px;
		}

		> .menu {
			margin-left: auto;
			margin-right: -16px;
		}
	}

	> div {
		height: calc(100% - var(--deckColumnHeaderHeight));
		overflow-y: auto;
		overflow-x: hidden; // fallback (overflow: clip)
		overflow-x: clip;
		-webkit-overflow-scrolling: touch;
		box-sizing: border-box;
	}
}
</style>
