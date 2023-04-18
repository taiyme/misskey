<template>
<div ref="rootEl" v-size="{ max: [500, 600] }" class="qglefbjs" :class="notification.type">
	<div class="head">
		<MkAvatar v-if="(notification.type as any) === 'pollEnded' && 'note' in notification" class="icon" :user="notification.note.user"/>
		<MkAvatar v-else-if="'user' in notification" class="icon" :user="notification.user"/>
		<img v-else-if="notification.icon" class="icon" :src="notification.icon" alt=""/>
		<div class="sub-icon" :class="notification.type">
			<i v-if="notification.type === 'follow'" class="ti ti-plus"></i>
			<i v-else-if="notification.type === 'receiveFollowRequest'" class="ti ti-clock"></i>
			<i v-else-if="notification.type === 'followRequestAccepted'" class="ti ti-check"></i>
			<i v-else-if="notification.type === 'groupInvited'" class="ti ti-certificate-2"></i>
			<i v-else-if="notification.type === 'renote'" class="ti ti-repeat"></i>
			<i v-else-if="notification.type === 'reply'" class="ti ti-arrow-back-up"></i>
			<i v-else-if="notification.type === 'mention'" class="ti ti-at"></i>
			<i v-else-if="notification.type === 'quote'" class="ti ti-quote"></i>
			<i v-else-if="notification.type === 'pollVote'" class="ti ti-chart-arrows"></i>
			<i v-else-if="(notification.type as any) === 'pollEnded'" class="ti ti-chart-arrows"></i>
			<!-- notification.reaction が null になることはまずないが、ここでoptional chaining使うと一部ブラウザで刺さるので念の為 -->
			<MkReactionIcon
				v-else-if="notification.type === 'reaction'"
				ref="reactionRef"
				:reaction="notification.reaction ? notification.reaction.replace(/^:(\w+):$/, ':$1@.:') : notification.reaction"
				:custom-emojis="notification.note.emojis"
				:no-style="true"
			/>
		</div>
	</div>
	<div class="tail">
		<header>
			<span v-if="(notification.type as any) === 'pollEnded'">{{ i18n.ts._notification.pollEnded }}</span>
			<MkA v-else-if="'user' in notification" v-user-preview="notification.user.id" class="name" :to="userPage(notification.user)"><MkUserName :user="notification.user"/></MkA>
			<span v-else>{{ notification.header }}</span>
			<MkTime v-if="withTime" :time="notification.createdAt" class="time"/>
		</header>
		<MkA v-if="notification.type === 'reaction'" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<i class="ti ti-quote"></i>
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
			<i class="ti ti-quote"></i>
		</MkA>
		<MkA v-if="notification.type === 'renote' && notification.note.renote" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note.renote)">
			<i class="ti ti-quote"></i>
			<Mfm :text="getNoteSummary(notification.note.renote)" :plain="true" :nowrap="true" :custom-emojis="notification.note.renote.emojis"/>
			<i class="ti ti-quote"></i>
		</MkA>
		<MkA v-if="notification.type === 'reply'" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
		</MkA>
		<MkA v-if="notification.type === 'mention'" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
		</MkA>
		<MkA v-if="notification.type === 'quote'" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
		</MkA>
		<MkA v-if="notification.type === 'pollVote'" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<i class="ti ti-quote"></i>
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
			<i class="ti ti-quote"></i>
		</MkA>
		<MkA v-if="(notification.type as any) === 'pollEnded' && 'note' in notification" class="text" :to="notePage(notification.note)" :title="getNoteSummary(notification.note)">
			<i class="ti ti-quote"></i>
			<Mfm :text="getNoteSummary(notification.note)" :plain="true" :nowrap="true" :custom-emojis="notification.note.emojis"/>
			<i class="ti ti-quote"></i>
		</MkA>
		<template v-if="notification.type === 'follow'">
			<span class="text" style="opacity: 0.6;">{{ i18n.ts.youGotNewFollower }}</span>
			<div v-if="full"><MkFollowButton :user="notification.user" :full="true"/></div>
		</template>
		<span v-if="notification.type === 'followRequestAccepted'" class="text" style="opacity: 0.6;">{{ i18n.ts.followRequestAccepted }}</span>
		<template v-if="notification.type === 'receiveFollowRequest'">
			<span class="text" style="opacity: 0.6;">{{ i18n.ts.receiveFollowRequest }}</span>
			<div v-if="full && !followRequestDone" class="followRequestCommands">
				<MkButton class="followRequestCommandButton" rounded primary @click="acceptFollowRequest()"><i class="ti ti-check"/> {{ i18n.ts.accept }}</MkButton>
				<MkButton class="followRequestCommandButton" rounded danger @click="rejectFollowRequest()"><i class="ti ti-x"/> {{ i18n.ts.reject }}</MkButton>
			</div>
		</template>
		<template v-if="notification.type === 'groupInvited'">
			<span class="text" style="opacity: 0.6;">{{ i18n.ts.groupInvited }}: <b>{{ notification.invitation.group.name }}</b></span>
			<div v-if="full && !groupInviteDone">
				<button class="_textButton" @click="acceptGroupInvitation()">{{ i18n.ts.accept }}</button> | <button class="_textButton" @click="rejectGroupInvitation()">{{ i18n.ts.reject }}</button>
			</div>
		</template>
		<span v-if="notification.type === 'app'" class="text">
			<Mfm :text="notification.body" :nowrap="false"/>
		</span>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as misskey from 'misskey-js';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import MkFollowButton from '@/components/MkFollowButton.vue';
import MkReactionTooltip from '@/components/MkReactionTooltip.vue';
import MkButton from '@/components/MkButton.vue';
import { getNoteSummary } from '@/scripts/get-note-summary';
import { notePage } from '@/filters/note';
import { userPage } from '@/filters/user';
import { i18n } from '@/i18n';
import * as os from '@/os';
import { stream } from '@/stream';
import { useTooltip } from '@/scripts/use-tooltip';

const props = withDefaults(defineProps<{
	notification: misskey.entities.Notification;
	withTime?: boolean;
	full?: boolean;
}>(), {
	withTime: false,
	full: false,
});

const rootEl = ref<HTMLElement | null>(null);
const reactionRef = ref<InstanceType<typeof MkReactionIcon> | null>(null);

let readObserver: IntersectionObserver | undefined;
let connection: misskey.ChannelConnection | undefined;

onMounted(() => {
	if (rootEl.value && !props.notification.isRead) {
		readObserver = new IntersectionObserver((entries, observer) => {
			if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
			stream.send('readNotification', {
				id: props.notification.id,
			});
			observer.disconnect();
		});

		readObserver.observe(rootEl.value);

		connection = stream.useChannel('main');
		connection.on('readAllNotifications', () => {
			readObserver?.disconnect();
		});

		watch($$(props.notification.isRead), () => {
			readObserver?.disconnect();
		});
	}
});

onUnmounted(() => {
	readObserver?.disconnect();
	connection?.dispose();
});

const followRequestDone = ref(false);
const groupInviteDone = ref(false);

const acceptFollowRequest = (): void => {
	if (props.notification.type !== 'followRequestAccepted') return;
	followRequestDone.value = true;
	os.api('following/requests/accept', { userId: props.notification.user.id });
};

const rejectFollowRequest = (): void => {
	if (props.notification.type !== 'followRequestAccepted') return;
	followRequestDone.value = true;
	os.api('following/requests/reject', { userId: props.notification.user.id });
};

const acceptGroupInvitation = (): void => {
	if (props.notification.type !== 'groupInvited') return;
	groupInviteDone.value = true;
	os.apiWithDialog('users/groups/invitations/accept', { invitationId: props.notification.invitation.id });
};

const rejectGroupInvitation = (): void => {
	if (props.notification.type !== 'groupInvited') return;
	groupInviteDone.value = true;
	os.api('users/groups/invitations/reject', { invitationId: props.notification.invitation.id });
};

useTooltip(reactionRef, (showing) => {
	if (props.notification.type !== 'reaction') return;
	os.popup(MkReactionTooltip, {
		showing,
		reaction: props.notification.reaction ? props.notification.reaction.replace(/^:(\w+):$/, ':$1@.:') : props.notification.reaction,
		emojis: props.notification.note.emojis,
		targetElement: reactionRef.value?.$el,
	}, {}, 'closed');
});
</script>

<style lang="scss" scoped>
.qglefbjs {
	position: relative;
	box-sizing: border-box;
	padding: 24px 32px;
	font-size: 0.9em;
	overflow-wrap: break-word;
	display: flex;
	contain: content;

	&.max-width_600px {
		padding: 16px;
		font-size: 0.9em;
	}

	&.max-width_500px {
		padding: 12px;
		font-size: 0.85em;
	}

	> .head {
		position: sticky;
		top: 0;
		flex-shrink: 0;
		width: 42px;
		height: 42px;
		margin-right: 8px;

		> .icon {
			display: block;
			width: 100%;
			height: 100%;
			border-radius: 6px;
		}

		> .sub-icon {
			position: absolute;
			z-index: 1;
			bottom: -2px;
			right: -2px;
			width: 20px;
			height: 20px;
			box-sizing: border-box;
			border-radius: 100%;
			background: var(--panel);
			box-shadow: 0 0 0 3px var(--panel);
			font-size: 11px;
			text-align: center;

			&:empty {
				display: none;
			}

			> * {
				color: #fff;
				width: 100%;
				height: 100%;
			}

			&.follow, &.followRequestAccepted, &.receiveFollowRequest, &.groupInvited {
				padding: 3px;
				background: #36aed2;
				pointer-events: none;
			}

			&.renote {
				padding: 3px;
				background: #36d298;
				pointer-events: none;
			}

			&.quote {
				padding: 3px;
				background: #36d298;
				pointer-events: none;
			}

			&.reply {
				padding: 3px;
				background: #007aff;
				pointer-events: none;
			}

			&.mention {
				padding: 3px;
				background: #88a6b7;
				pointer-events: none;
			}

			&.pollVote {
				padding: 3px;
				background: #88a6b7;
				pointer-events: none;
			}

			&.pollEnded {
				padding: 3px;
				background: #88a6b7;
				pointer-events: none;
			}
		}
	}

	> .tail {
		flex: 1;
		min-width: 0;

		> header {
			display: flex;
			align-items: baseline;
			white-space: nowrap;

			> .name {
				text-overflow: ellipsis;
				white-space: nowrap;
				min-width: 0;
				overflow: hidden;
			}

			> .time {
				margin-left: auto;
				font-size: 0.9em;
			}
		}

		> .text {
			display: flex;
			width: 100%;
			overflow: clip;

			> i {
				vertical-align: super;
				font-size: 50%;
				opacity: 0.5;
			}

			> i:first-child {
				margin-right: 4px;
			}

			> i:last-child {
				margin-left: 4px;
			}
		}

		> .followRequestCommands {
			display: flex;
			gap: 8px;
			max-width: 300px;
			margin-top: 8px;

			> .followRequestCommandButton {
				flex: 1;
			}
		}
	}
}
</style>
