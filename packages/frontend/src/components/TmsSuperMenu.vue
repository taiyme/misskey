<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="{
		[$style.root]: true,
		[$style.gridView]: !props.wideMode && tmsStore.reactiveState.superMenuDisplayMode.value === 'default',
		[$style.listView]: !props.wideMode && tmsStore.reactiveState.superMenuDisplayMode.value === 'forceList',
		[$style.classicView]: !props.wideMode && tmsStore.reactiveState.superMenuDisplayMode.value === 'classic',
	}"
>
	<div v-for="(group, i) in props.def" :key="`group:${i}`" :class="$style.group">
		<div v-if="group.title" :class="$style.groupTitle">{{ group.title }}</div>

		<div :class="$style.items">
			<template v-for="(item, j) in group.items">
				<a
					v-if="item.type === 'a'"
					:key="`group:${i}-a:${j}`"
					:href="item.href"
					:target="item.target"
					tabindex="0"
					class="_button"
					:class="{
						[$style.item]: true,
						[$style.danger]: item.danger,
						[$style.active]: item.active,
					}"
				>
					<span v-if="item.icon" :class="$style.itemIcon"><i :class="item.icon" class="ti-fw"></i></span>
					<span :class="$style.itemText">{{ item.text }}</span>
				</a>
				<button
					v-else-if="item.type === 'button'"
					:key="`group:${i}-button:${j}`"
					tabindex="0"
					class="_button"
					:class="{
						[$style.item]: true,
						[$style.danger]: item.danger,
						[$style.active]: item.active,
					}"
					:disabled="item.active"
					@click="(ev) => item.action(ev)"
				>
					<span v-if="item.icon" :class="$style.itemIcon"><i :class="item.icon" class="ti-fw"></i></span>
					<span :class="$style.itemText">{{ item.text }}</span>
				</button>
				<MkA
					v-else
					:key="`group:${i}-link:${j}`"
					:to="item.to"
					tabindex="0"
					class="_button"
					:class="{
						[$style.item]: true,
						[$style.danger]: item.danger,
						[$style.active]: item.active,
					}"
				>
					<span v-if="item.icon" :class="$style.itemIcon"><i :class="item.icon" class="ti-fw"></i></span>
					<span :class="$style.itemText">{{ item.text }}</span>
				</MkA>
			</template>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { tmsStore } from '@/tms/store.js';
import { type TmsSuperMenuProps } from '@/components/TmsSuperMenu.impl.js';

const props = defineProps<TmsSuperMenuProps>();
</script>

<style lang="scss" module>
.root {
	.group {
		display: flex;
		flex-direction: column;
		gap: 8px;

		& + .group {
			margin-top: 16px;
			padding-top: 16px;
			border-top: solid 0.5px var(--MI_THEME-divider);
		}
	}

	.groupTitle {
		opacity: 0.7;
		font-size: 0.9em;
	}

	.item {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		padding: 9px 8px;
		border-radius: 9px;
		font-size: 0.9em;
		transition: background-color 0.1s ease;

		&:hover {
			text-decoration: none;
		}

		&.active, &:hover {
			color: var(--MI_THEME-accent);
			background-color: var(--MI_THEME-accentedBg);
		}

		&.danger {
			color: var(--MI_THEME-error);
		}
	}

	.itemIcon {
		display: block;
		width: 20px;
		flex-shrink: 0;
		text-align: center;
		opacity: 0.8;
	}

	.itemText {
		display: block;
		white-space: normal;
		flex-shrink: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}
}

.gridView {
	.group {
		padding-right: 16px;
		padding-left: 16px;
	}

	.groupTitle {
		font-size: 1em;
	}

	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
		gap: 16px;
	}

	.item {
		flex-direction: column;
		gap: 6px;
		text-align: center;
		padding: 0;

		&.active, &:hover {
			background-color: transparent;
			color: var(--MI_THEME-accent);
			transition: none;

			> .itemIcon {
				background-color: var(--MI_THEME-accentedBg);
			}
		}
	}

	.itemIcon {
		display: grid;
		place-content: center;
		font-size: 1.5em;
		width: 60px;
		height: 60px;
		aspect-ratio: 1;
		background-color: var(--MI_THEME-panel);
		border-radius: 100%;
		transition: background-color 0.1s ease;
	}

	.itemText {
		width: 100%;
		font-size: 0.8em;
	}
}

.classicView {
	.group {
		padding-right: 16px;
		padding-left: 16px;

		& + .group {
			padding-top: 0;
			border-top: 0;
		}
	}

	.groupTitle {
		font-size: 1em;
	}

	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 8px;
	}

	.item {
		flex-direction: column;
		gap: 12px;
		padding: 18px 16px 16px 16px;
		background-color: var(--MI_THEME-panel);
		border-radius: 8px;
		text-align: center;
	}

	.itemIcon {
		font-size: 1.5em;
	}

	.itemText {
		width: 100%;
		font-size: 0.8em;
	}
}

.listView {
	.groupTitle {
		font-size: 1em;
	}

	.item {
		font-size: 1em;
		padding: 10px 8px;
	}
}
</style>
