<template>
<div
	v-if="!muted"
	v-show="!isDeleted"
	ref="el"
	v-hotkey="keymap"
	v-size="{ max: [500, 450, 350, 300] }"
	class="lxwezrsl _block"
	:tabindex="!isDeleted ? '-1' : undefined"
	:class="{ renote: isRenote }"
>
	<MkNoteSub v-for="convNote in conversation" :key="convNote.id" class="reply-to-more" :note="convNote"/>
	<MkNoteSub v-if="appearNote.reply" :note="appearNote.reply" class="reply-to"/>
	<div v-if="isRenote" class="renote">
		<MkAvatar class="avatar" :user="note.user"/>
		<i class="ti ti-repeat"></i>
		<I18n :src="i18n.ts.renotedBy" tag="span">
			<template #user>
				<MkA v-user-preview="note.userId" class="name" :to="userPage(note.user)">
					<MkUserName :user="note.user"/>
				</MkA>
			</template>
		</I18n>
		<div class="info">
			<button ref="renoteTime" class="_button time" @click="showRenoteMenu()">
				<i v-if="isMyRenote" class="ti ti-dots dropdownIcon"></i>
				<MkTime :time="note.createdAt"/>
			</button>
			<MkVisibility :note="note"/>
		</div>
	</div>
	<article class="article" @contextmenu.stop="onContextmenu">
		<header class="header">
			<MkAvatar class="avatar" :user="appearNote.user" :show-indicator="true"/>
			<div class="body">
				<div class="top">
					<MkA v-user-preview="appearNote.user.id" class="name" :to="userPage(appearNote.user)">
						<MkUserName :nowrap="false" :user="appearNote.user"/>
					</MkA>
					<span v-if="(appearNote.user as any /* 定義されていないため */).isBot" class="is-bot">bot</span>
					<div class="info">
						<MkVisibility :note="appearNote"/>
					</div>
				</div>
				<div class="username"><MkAcct :user="appearNote.user"/></div>
				<MkInstanceTicker v-if="showTicker" :instance="appearNote.user.instance" force-type="normal"/>
			</div>
		</header>
		<div class="main">
			<div class="body">
				<p v-if="appearNote.cw != null" class="cw">
					<Mfm v-if="appearNote.cw != ''" class="text" :text="appearNote.cw" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
					<MkCwButton v-model="showContent" :note="appearNote"/>
				</p>
				<div v-show="appearNote.cw == null || showContent" class="content">
					<div class="text">
						<span v-if="appearNote.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
						<MkA v-if="appearNote.replyId" class="reply" :to="`/notes/${appearNote.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
						<Mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
						<a v-if="appearNote.renote != null" class="rp">RN:</a>
						<div v-if="translating || translation" class="translation">
							<MkLoading v-if="translating" mini/>
							<div v-else class="translated">
								<b>{{ i18n.t('translatedFrom', { x: (translation as any /* 定義されていないため */).sourceLang }) }}: </b>
								<Mfm :text="(translation as any /* 定義されていないため */).text" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
							</div>
						</div>
					</div>
					<div v-if="appearNote.files.length > 0" class="files">
						<MkMediaList :media-list="appearNote.files"/>
					</div>
					<MkPoll v-if="appearNote.poll" ref="pollViewer" :note="appearNote" class="poll"/>
					<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="true" class="url-preview"/>
					<div v-if="appearNote.renote" class="renote"><MkNoteSimple :note="appearNote.renote"/></div>
				</div>
				<MkA v-if="(appearNote as any /* 定義されていないため */).channel && !inChannel" class="channel" :to="`/channels/${(appearNote as any /* 定義されていないため */).channel.id}`"><i class="ti ti-device-tv"></i> {{ (appearNote as any /* 定義されていないため */).channel.name }}</MkA>
			</div>
			<footer class="footer">
				<div class="info">
					<MkA class="created-at" :to="notePage(appearNote)">
						<MkTime :time="appearNote.createdAt" mode="detail"/>
					</MkA>
				</div>
				<MkReactionsViewer ref="reactionsViewer" :note="appearNote"/>
				<button class="button _button" @click="reply()">
					<i class="ti ti-arrow-back-up"></i>
					<p v-if="appearNote.repliesCount > 0" class="count">{{ appearNote.repliesCount }}</p>
				</button>
				<MkRenoteButton ref="renoteButton" class="button" :note="appearNote" :count="appearNote.renoteCount"/>
				<button v-if="appearNote.myReaction == null" ref="reactButton" class="button _button" @click="react()">
					<i class="ti ti-plus"></i>
				</button>
				<button v-if="appearNote.myReaction != null" ref="reactButton" class="button _button reacted" @click="undoReact(appearNote)">
					<i class="ti ti-minus"></i>
				</button>
				<button ref="menuButton" class="button _button" @click="menu()">
					<i class="ti ti-dots"></i>
				</button>
			</footer>
		</div>
	</article>
	<MkNoteSub v-for="replyNote in replies" :key="replyNote.id" :note="replyNote" class="reply" :detail="true"/>
</div>
<div v-else class="_panel muted" @click="muted = false">
	<I18n :src="i18n.ts.userSaysSomething" tag="small">
		<template #name>
			<MkA v-user-preview="appearNote.userId" class="name" :to="userPage(appearNote.user)">
				<MkUserName :nowrap="false" :user="appearNote.user"/>
			</MkA>
		</template>
	</I18n>
</div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref, Ref } from 'vue';
import { ReactiveVariable } from 'vue/macros';
import * as mfm from 'mfm-js';
import * as misskey from 'misskey-js';
import MkNoteSub from '@/components/MkNoteSub.vue';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkReactionsViewer from '@/components/MkReactionsViewer.vue';
import MkMediaList from '@/components/MkMediaList.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import MkPoll from '@/components/MkPoll.vue';
import MkRenoteButton from '@/components/MkRenoteButton.vue';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import MkInstanceTicker from '@/components/MkInstanceTicker.vue';
import MkVisibility from '@/components/MkVisibility.vue';
import { pleaseLogin } from '@/scripts/please-login';
import { checkWordMute } from '@/scripts/check-word-mute';
import { userPage } from '@/filters/user';
import { notePage } from '@/filters/note';
import * as os from '@/os';
import { defaultStore, noteViewInterruptors } from '@/store';
import { reactionPicker } from '@/scripts/reaction-picker';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm';
import { $i } from '@/account';
import { i18n } from '@/i18n';
import { getNoteMenu } from '@/scripts/get-note-menu';
import { useNoteCapture } from '@/scripts/use-note-capture';
import { deepClone } from '@/scripts/clone';
import { disableContextmenu } from '@/scripts/touch';
import { isPureRenote } from '@/scripts/tms/is-pure-renote';

const props = defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();

const inChannel = inject('inChannel', null);

let note = $ref<misskey.entities.Note>(deepClone(props.note));

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result = deepClone(note);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result) as ReactiveVariable<misskey.entities.Note>; // unknownのため
		}
		note = result;
	});
}

const isRenote = isPureRenote(note);

const el = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const renoteButton = ref<InstanceType<typeof MkRenoteButton>>();
const renoteTime = ref<HTMLElement>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() => isPureRenote(note) ? note.renote : note); // 本当はisRenoteを使いたいけど型推論してくれない
const isMyRenote = $i && ($i.id === note.userId || $i.isModerator || $i.isAdmin);
const showContent = ref(false);
const isDeleted = ref(false);
const muted = ref(checkWordMute(appearNote, $i, defaultStore.state.mutedWords));
const translation = ref(null);
const translating = ref(false);
const urls = appearNote.text ? extractUrlFromMfm(mfm.parse(appearNote.text)) : null;
const showTicker = (defaultStore.state.instanceTicker === 'always') || (defaultStore.state.instanceTicker === 'remote' && appearNote.user.instance);
const conversation = ref<misskey.entities.Note[]>([]);
const replies = ref<misskey.entities.Note[]>([]);

const keymap = {
	'r': (): void => reply(true),
	'e|a|plus': (): void => react(true),
	'q': (): void => renoteButton.value?.renote(true),
	'esc': (): void => blur(),
	'm|o': (): void => menu(true),
};

useNoteCapture({
	rootEl: el as Ref<HTMLElement>, // undefinedを除外するため
	note: $$(appearNote),
	isDeletedRef: isDeleted,
});

const reply = (viaKeyboard = false): void => {
	pleaseLogin();
	os.post({
		reply: appearNote,
		animation: !viaKeyboard,
	});
};

const react = (_viaKeyboard = false): void => {
	if (!reactButton.value) return;

	pleaseLogin();
	blur();
	reactionPicker.show(reactButton.value, reaction => {
		os.api('notes/reactions/create', {
			noteId: appearNote.id,
			reaction: reaction,
		});
	}, focus);
};

const undoReact = (note_: misskey.entities.Note): void => {
	const oldReaction = note_.myReaction;
	if (!oldReaction) return;
	os.api('notes/reactions/delete', {
		noteId: note_.id,
	});
};

const onContextmenu = (ev: MouseEvent): void => {
	if (disableContextmenu) return;
	const isLink = (elem: HTMLElement): boolean => {
		if (elem.tagName === 'A') return true;
		if (elem.parentElement) {
			return isLink(elem.parentElement);
		}

		return false;
	};
	if (!(ev.target instanceof HTMLElement)) return;
	if (isLink(ev.target)) return;
	if (window.getSelection()?.toString() !== '') return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			getNoteMenu({
				note,
				translating,
				translation,
				// menuButton,
				isDeleted,
			}),
			ev,
		).then(focus);
	}
};

const menu = (viaKeyboard = false): void => {
	os.popupMenu(
		getNoteMenu({
			note,
			translating,
			translation,
			// menuButton,
			isDeleted,
		}),
		menuButton.value,
		{ viaKeyboard },
	).then(focus);
};

const showRenoteMenu = (viaKeyboard = false): void => {
	if (!isMyRenote) return;
	os.popupMenu([{
		text: i18n.ts.unrenote,
		icon: 'ti ti-trash',
		danger: true,
		action: (): void => {
			os.api('notes/delete', {
				noteId: note.id,
			});
			isDeleted.value = true;
		},
	}], renoteTime.value, {
		viaKeyboard: viaKeyboard,
	});
};

const focus = (): void => {
	el.value?.focus();
};

const blur = (): void => {
	el.value?.blur();
};

os.api('notes/children', {
	noteId: appearNote.id,
	limit: 30,
}).then(res => {
	replies.value = res;
});

if (appearNote.replyId) {
	os.api('notes/conversation', {
		noteId: appearNote.replyId,
	}).then(res => {
		const resTyped = res as misskey.entities.Note[]; // TODO型のため
		conversation.value = resTyped.reverse();
	});
}
</script>

<style lang="scss" scoped>
.lxwezrsl {
	position: relative;
	transition: box-shadow 0.1s ease;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	contain: content;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: calc(100% - 8px);
			height: calc(100% - 8px);
			border: dashed 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	&:hover > .article > .main > .footer > .button {
		opacity: 1;
	}

	> .reply-to {
		opacity: 0.7;
		padding-bottom: 0;
	}

	> .reply-to-more {
		opacity: 0.7;
	}

	> .renote {
		display: flex;
		align-items: center;
		padding: 16px 32px 8px 32px;
		line-height: 28px;
		white-space: pre;
		color: var(--renote);

		> .avatar {
			flex-shrink: 0;
			display: inline-block;
			width: 28px;
			height: 28px;
			margin: 0 8px 0 0;
			border-radius: 6px;
		}

		> i {
			margin-right: 4px;
		}

		> span {
			overflow: hidden;
			flex-shrink: 1;
			text-overflow: ellipsis;
			white-space: nowrap;

			> .name {
				font-weight: bold;
			}
		}

		> .info {
			margin-left: auto;
			font-size: 0.9em;

			> .time {
				flex-shrink: 0;
				color: inherit;

				> .dropdownIcon {
					margin-right: 4px;
				}
			}
		}
	}

	> .renote + .article {
		padding-top: 8px;
	}

	> .article {
		padding: 32px;
		font-size: 1.2em;

		> .header {
			display: flex;
			position: relative;
			margin-bottom: 16px;
			align-items: center;

			> .avatar {
				display: block;
				flex-shrink: 0;
				width: 58px;
				height: 58px;
			}

			> .body {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding-left: 16px;
				font-size: 0.95em;

				> .top {
					> .name {
						font-weight: bold;
						line-height: 1.3;
					}

					> .is-bot {
						display: inline-block;
						margin: 0 0.5em;
						padding: 4px 6px;
						font-size: 80%;
						line-height: 1;
						border: solid 0.5px var(--divider);
						border-radius: 4px;
					}

					> .info {
						float: right;
					}
				}

				> .username {
					margin-bottom: 2px;
					line-height: 1.3;
					word-wrap: anywhere;
				}
			}
		}

		> .main {
			> .body {
				> .cw {
					cursor: default;
					display: block;
					margin: 0;
					padding: 0;
					overflow-wrap: break-word;

					> .text {
						margin-right: 8px;
					}
				}

				> .content {
					> .text {
						overflow-wrap: break-word;

						> .reply {
							color: var(--accent);
							margin-right: 0.5em;
						}

						> .rp {
							margin-left: 4px;
							font-style: oblique;
							color: var(--renote);
						}

						> .translation {
							border: solid 0.5px var(--divider);
							border-radius: var(--radius);
							padding: 12px;
							margin-top: 8px;
						}
					}

					> .url-preview {
						margin-top: 8px;
					}

					> .poll {
						font-size: 80%;
					}

					> .renote {
						padding: 8px 0;

						> * {
							padding: 16px;
							border: dashed 1px var(--renote);
							border-radius: 8px;
						}
					}
				}

				> .channel {
					opacity: 0.7;
					font-size: 80%;
				}
			}

			> .footer {
				> .info {
					margin: 16px 0;
					opacity: 0.7;
					font-size: 0.9em;
				}

				> .button {
					margin: 0;
					padding: 8px;
					opacity: 0.7;

					&:not(:last-child) {
						margin-right: 28px;
					}

					&:hover {
						color: var(--fgHighlighted);
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}
		}
	}

	> .reply {
		border-top: solid 0.5px var(--divider);
	}

	&.max-width_500px {
		font-size: 0.9em;
	}

	&.max-width_450px {
		> .renote {
			padding: 8px 16px 0 16px;
		}

		> .article {
			padding: 16px;

			> .header {
				> .avatar {
					width: 50px;
					height: 50px;
				}
			}
		}
	}

	&.max-width_350px {
		> .article {
			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 18px;
						}
					}
				}
			}
		}
	}

	&.max-width_300px {
		font-size: 0.825em;

		> .article {
			> .header {
				> .avatar {
					width: 50px;
					height: 50px;
				}
			}

			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 12px;
						}
					}
				}
			}
		}
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}
</style>
