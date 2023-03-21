<template>
<div v-if="user" :class="$style.root">
	<article :class="$style.article">
		<MkAvatar :class="$style.avatar" :user="user" disable-link disable-preview/>
		<div :class="$style.main">
			<header :class="$style.header">
				<div :class="$style.name"><MkUserName :user="user"/></div>
				<div :class="$style.username"><MkAcct :user="user"/></div>
				<div :class="$style.info"><div><MkTime :time="createdAt"/></div></div>
			</header>
			<MkInstanceTicker :force-type="instanceTickerPosition"/>
			<div :class="$style.body">
				<div :class="$style.content">
					<div :class="$style.text"><Mfm :text="text" :author="user" :i="$i"/></div>
				</div>
			</div>
			<footer>
				<div :style="$style.reactionsViewer">
					<button
						ref="reactButton"
						:class="$style.reactionButton"
						class="_button"
						@click="react"
					>
						<MkEmoji emoji="👍" :custom-emojis="[]" :is-reaction="true" :normal="true"/>
						<span :class="$style.reactionCount">1</span>
					</button>
				</div>
				<button :class="$style.button" class="_button"><i class="ti ti-arrow-back-up"></i></button>
				<button :class="$style.button" class="_button"><i class="ti ti-repeat"></i></button>
				<button :class="$style.button" class="_button"><i class="ti ti-plus"></i></button>
				<button :class="$style.button" class="_button"><i class="ti ti-dots"></i></button>
			</footer>
		</div>
	</article>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MkInstanceTicker from '@/components/MkInstanceTicker.vue';
import { api } from '@/os';
import { $i } from '@/account';
import { tmsStore } from '@/tms/store';
import { getReactMenuDryrun, toggleReactDryrun } from '@/scripts/tms/get-react-menu';

const props = withDefaults(defineProps<{
	text?: string;
	instanceTickerPosition?: typeof tmsStore.state.instanceTickerPosition;
	useReactionMenu?: typeof tmsStore.state.useReactionMenu;
}>(), {
	text: 'Oh my Aichan',
	instanceTickerPosition: tmsStore.state.instanceTickerPosition,
	useReactionMenu: tmsStore.state.useReactionMenu,
});

const user = ref($i && await api('users/show', { userId: $i.id }));
const createdAt = ref(new Date().toJSON());
const reactButton = ref<HTMLElement>();

const react = (): void => {
	if (props.useReactionMenu) {
		getReactMenuDryrun({ reactButton });
	} else {
		toggleReactDryrun({ reactButton });
	}
};
</script>

<style lang="scss" module>
.root {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	background: var(--panel);
}

.article {
	display: flex;
	padding: 28px 32px 18px;
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 14px 8px 0;
	width: 58px;
	height: 58px;
	position: relative;
	top: 0;
	left: 0;
}

.main {
	flex: 1;
	min-width: 0;
}

.header {
	display: flex;
	align-items: baseline;
	white-space: nowrap;
}

.name {
	flex-shrink: 1;
	display: block;
	margin: 0 .5em 0 0;
	padding: 0;
	overflow: hidden;
	font-size: 1em;
	font-weight: bold;
	text-decoration: none;
	text-overflow: ellipsis;

	&:hover {
		text-decoration: underline;
	}
}

.username {
	flex-shrink: 9999999;
	margin: 0 .5em 0 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.info {
	flex-shrink: 0;
	margin-left: auto;
	font-size: 0.9em;
}

.text {
	overflow-wrap: break-word;
}

.button {
	margin: 0;
	padding: 8px;

	&:not(:last-child) {
		margin-right: 28px;
	}

	&:hover {
		color: var(--fgHighlighted);
	}
}

.reactionsViewer {
	margin: 4px -2px 0 -2px;
}

.reactionButton {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.05);

	&:hover {
		background: rgba(0, 0, 0, 0.1);
	}
}

.reactionCount {
	font-size: 0.9em;
	line-height: 32px;
	margin: 0 0 0 4px;
}
</style>
