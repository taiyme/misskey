<template>
<div
	v-size="{ max: [310, 500] }" class="gafaadew"
	:class="[$style.root, { [$style.modal]: modal, _popup: modal }]"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header :class="$style.header">
		<div :class="$style.headerLeft">
			<button v-if="!fixed" :class="$style.cancel" class="_button" @click="cancel"><i class="ti ti-x"></i></button>
			<button v-click-anime v-tooltip="i18n.ts.switchAccount" :class="$style.account" class="_button" @click="openAccountMenu">
				<MkAvatar :user="postAccount ?? $i" :class="$style.avatar"/>
			</button>
		</div>
		<div :class="$style.headerRight">
			<button v-click-anime v-tooltip="i18n.ts._tms.drafts" class="_button" :class="$style.headerRightItem" @click="chooseDraft">
				<span :class="$style.headerRightButtonIcon"><i class="ti ti-notes"></i></span>
			</button>
			<button v-click-anime v-tooltip="i18n.ts._visibility.disableFederation" class="_button" :class="$style.headerRightItem" :disabled="channel != null || visibility === 'specified'" @click="localOnly = !localOnly">
				<span v-if="!localOnly" :class="$style.headerRightButtonIcon"><i class="ti ti-rocket"></i></span>
				<span v-else :class="$style.headerRightButtonIcon"><i class="ti ti-rocket-off" style="color: var(--error);"></i></span>
			</button>
			<template v-if="!(channel != null && fixed)">
				<button v-if="channel == null" ref="visibilityButton" v-click-anime v-tooltip="i18n.ts.visibility" class="_button" :class="[$style.headerRightItem, $style.visibility]" @click="setVisibility">
					<span v-if="visibility === 'public'" :class="$style.headerRightButtonIcon"><i class="ti ti-world"></i></span>
					<span v-if="visibility === 'home'" :class="$style.headerRightButtonIcon"><i class="ti ti-home"></i></span>
					<span v-if="visibility === 'followers'" :class="$style.headerRightButtonIcon"><i class="ti ti-lock"></i></span>
					<span v-if="visibility === 'specified'" :class="$style.headerRightButtonIcon"><i class="ti ti-mail"></i></span>
					<span :class="$style.headerRightButtonText">{{ i18n.ts._visibility[visibility] }}</span>
				</button>
				<button v-else class="_button" :class="[$style.headerRightItem, $style.visibility]" disabled>
					<span :class="$style.headerRightButtonIcon"><i class="ti ti-device-tv"></i></span>
					<span :class="$style.headerRightButtonText">{{ channel.name }}</span>
				</button>
			</template>
			<button v-click-anime v-tooltip="i18n.ts.previewNoteText" class="_button" :class="[$style.headerRightItem, { [$style.previewButtonActive]: showPreview }]" @click="showPreview = !showPreview"><i class="ti ti-eye"></i></button>
			<button v-click-anime class="_button" :class="[$style.submit, { [$style.submitPosting]: posting }]" :disabled="!canPost" data-cy-open-post-form-submit @click="post">
				<div :class="$style.submitInner">
					<template v-if="posted"></template>
					<template v-else-if="posting"><MkEllipsis/></template>
					<template v-else>{{ submitText }}</template>
					<i style="margin-left: 6px;" :class="posted ? 'ti ti-check' : reply ? 'ti ti-arrow-back-up' : renote ? 'ti ti-quote' : 'ti ti-send'"></i>
				</div>
			</button>
		</div>
	</header>
	<MkNoteSimple v-if="reply" :class="$style.targetNote" :note="reply"/>
	<MkNoteSimple v-if="renote" :class="$style.targetNote" :note="renote"/>
	<div v-if="quoteId" :class="$style.withQuote"><i class="ti ti-quote"></i> {{ i18n.ts.quoteAttached }}<button @click="quoteId = null"><i class="ti ti-x"></i></button></div>
	<div v-if="visibility === 'specified'" :class="$style.toSpecified">
		<span style="margin-right: 8px;">{{ i18n.ts.recipient }}</span>
		<div :class="$style.visibleUsers">
			<span v-for="u in visibleUsers" :key="u.id" :class="$style.visibleUser">
				<MkAcct :user="u"/>
				<button class="_button" style="padding: 4px 8px;" @click="removeVisibleUser(u)"><i class="ti ti-x"></i></button>
			</span>
			<button class="_buttonPrimary" style="padding: 4px; border-radius: 8px;" @click="addVisibleUser"><i class="ti ti-plus ti-fw"></i></button>
		</div>
	</div>
	<MkInfo v-if="hasNotSpecifiedMentions" warn :class="$style.info">{{ i18n.ts.notSpecifiedMentionWarning }} - <button class="_textButton" @click="addMissingMention()">{{ i18n.ts.add }}</button></MkInfo>
	<MkInfo v-if="annoyingPost" warn :class="$style.info">{{ i18n.ts.thisPostMayBeAnnoying }}</MkInfo>
	<input v-show="useCw" ref="cwInputEl" v-model="cw" :class="$style.cw" :placeholder="i18n.ts.annotation" @keydown="onKeydown">
	<div :class="[$style.textOuter, { [$style.withCw]: useCw }]">
		<textarea ref="textareaEl" v-model="text" :class="[$style.text]" :disabled="posting || posted" :placeholder="placeholder" data-cy-post-form-text @keydown="onKeydown" @paste="onPaste" @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd"/>
		<div class="_acrylic" :class="[$style.textCount, { [$style.textOver]: textLength > maxTextLength }]">{{ maxTextLength - textLength }}</div>
	</div>
	<input v-show="withHashtags" ref="hashtagsInputEl" v-model="hashtags" :class="$style.hashtags" :placeholder="i18n.ts.hashtags" list="hashtags">
	<XPostFormAttaches :class="$style.attaches" :files="files" @updated="updateFiles" @detach="detachFile" @change-sensitive="updateFileSensitive" @change-name="updateFileName"/>
	<MkPollEditor v-if="poll" v-model="poll" @destroyed="poll = null"/>
	<MkNotePreview v-if="showPreview" :class="$style.preview" :text="text"/>
	<footer :class="$style.footer">
		<div :class="$style.footerLeft">
			<button v-tooltip="i18n.ts.attachFile" class="_button" :class="$style.footerButton" @click="chooseFileFrom"><i class="ti ti-photo-plus"></i></button>
			<button v-tooltip="i18n.ts.poll" class="_button" :class="[$style.footerButton, { [$style.footerButtonActive]: poll }]" @click="togglePoll"><i class="ti ti-chart-arrows"></i></button>
			<button v-tooltip="i18n.ts.useCw" class="_button" :class="[$style.footerButton, { [$style.footerButtonActive]: useCw }]" @click="useCw = !useCw"><i class="ti ti-eye-off"></i></button>
			<button v-tooltip="i18n.ts.mention" class="_button" :class="$style.footerButton" @click="insertMention"><i class="ti ti-at"></i></button>
			<button v-tooltip="i18n.ts.hashtags" class="_button" :class="[$style.footerButton, { [$style.footerButtonActive]: withHashtags }]" @click="withHashtags = !withHashtags"><i class="ti ti-hash"></i></button>
			<button v-if="postFormActions.length > 0" v-tooltip="i18n.ts.plugin" class="_button" :class="$style.footerButton" @click="showActions"><i class="ti ti-plug"></i></button>
			<button v-tooltip="i18n.ts.emoji" class="_button" :class="[$style.footerButton]" @click="insertEmoji"><i class="ti ti-mood-happy"></i></button>
		</div>
	</footer>
	<datalist id="hashtags">
		<option v-for="hashtag in recentHashtags" :key="hashtag" :value="hashtag"/>
	</datalist>
</div>
</template>

<script lang="ts" setup>
import { inject, watch, nextTick, onMounted, defineAsyncComponent } from 'vue';
import * as mfm from 'mfm-js';
import * as misskey from 'misskey-js';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode/';
import * as Acct from 'misskey-js/built/acct';
import { throttle } from 'throttle-debounce';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkNotePreview from '@/components/MkNotePreview.vue';
import XPostFormAttaches from '@/components/MkPostFormAttaches.vue';
import MkPollEditor from '@/components/MkPollEditor.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { host, url } from '@/config';
import { erase, unique } from '@/scripts/array';
import { extractMentions } from '@/scripts/extract-mentions';
import { formatTimeString } from '@/scripts/format-time-string';
import { Autocomplete } from '@/scripts/autocomplete';
import * as os from '@/os';
import { stream } from '@/stream';
import { selectFiles } from '@/scripts/select-file';
import { defaultStore, notePostInterruptors, postFormActions } from '@/store';
import MkInfo from '@/components/MkInfo.vue';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i, getAccounts, openAccountMenu as openAccountMenu_ } from '@/account';
import { uploadFile } from '@/scripts/upload';
import { deepClone } from '@/scripts/clone';
import { parseObject, parseArray } from '@/scripts/tms/parse';
import { imanonashi } from '@/scripts/tms/imanonashi';
import { DraftWithId, getDraft as _getDraft, setDraft as _setDraft, deleteDraft as _deleteDraft } from '@/scripts/tms/drafts';

const modal = inject('modal');

const props = withDefaults(defineProps<{
	reply?: misskey.entities.Note;
	renote?: misskey.entities.Note;
	channel?: misskey.entities.Channel; // TODO
	mention?: misskey.entities.User;
	specified?: misskey.entities.User;
	initialText?: string;
	initialVisibility?: 'public' | 'home' | 'followers' | 'specified';
	initialFiles?: misskey.entities.DriveFile[];
	initialLocalOnly?: boolean;
	initialVisibleUsers?: misskey.entities.User[];
	initialNote?: misskey.entities.Note;
	instant?: boolean;
	fixed?: boolean;
	autofocus?: boolean;
	freezeAfterPosted?: boolean;
}>(), {
	initialVisibleUsers: () => [],
	autofocus: true,
});

const emit = defineEmits<{
	(ev: 'posted'): void;
	(ev: 'cancel'): void;
	(ev: 'esc'): void;
}>();

const textareaEl = $shallowRef<HTMLTextAreaElement | null>(null);
const cwInputEl = $shallowRef<HTMLInputElement | null>(null);
const hashtagsInputEl = $shallowRef<HTMLInputElement | null>(null);
const visibilityButton = $shallowRef<HTMLElement | null>(null);

let posting = $ref(false);
let posted = $ref(false);
let text = $ref(props.initialText ?? '');
let files = $ref(props.initialFiles ?? []);
let poll = $ref<{
	choices: string[];
	multiple: boolean;
	expiresAt: string | null;
	expiredAfter: string | null;
} | null>(null);
let useCw = $ref(false);
let showPreview = $ref(false);
let cw = $ref<string | null>(null);
let localOnly = $ref<boolean>(props.initialLocalOnly ?? defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly);
let visibility = $ref<'public' | 'home' | 'followers' | 'specified'>(props.initialVisibility ?? defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility);
let visibleUsers = $ref<misskey.entities.User[]>([]);
props.initialVisibleUsers.forEach(user => pushVisibleUser(user));
let autocomplete = $ref(null);
let draghover = $ref(false);
let quoteId = $ref<string | null>(null);
let hasNotSpecifiedMentions = $ref(false);
let annoyingPost = $ref(false);
let recentHashtags = $ref(parseArray<string[]>(localStorage.getItem('hashtags')));
let imeText = $ref('');

const typing = throttle(3000, () => {
	if (props.channel) {
		stream.send('typingOnChannel', { channel: props.channel.id });
	}
});

let draftKey = $computed((): string | null => {
	if (!$i?.id) return null;

	let key = props.channel ? `ch:${props.channel.id}/` : '';

	if (props.renote) {
		key += `rn:${props.renote.id}`;
	} else if (props.reply) {
		key += `re:${props.reply.id}`;
	} else {
		key += `note:${$i.id}`;
	}

	return key;
});

const placeholder = $computed((): string => {
	if (props.renote) {
		return i18n.ts._postForm.quotePlaceholder;
	} else if (props.reply) {
		return i18n.ts._postForm.replyPlaceholder;
	} else if (props.channel) {
		return i18n.ts._postForm.channelPlaceholder;
	} else {
		const xs = [
			i18n.ts._postForm._placeholders.a,
			i18n.ts._postForm._placeholders.b,
			i18n.ts._postForm._placeholders.c,
			i18n.ts._postForm._placeholders.d,
			i18n.ts._postForm._placeholders.e,
			i18n.ts._postForm._placeholders.f,
		];
		return xs[Math.floor(Math.random() * xs.length)];
	}
});

const submitText = $computed((): string => {
	return props.renote
		? i18n.ts.quote
		: props.reply
			? i18n.ts.reply
			: i18n.ts.note;
});

const textLength = $computed((): number => {
	return length((text + imeText).trim());
});

const maxTextLength = $computed((): number => {
	return instance ? instance.maxNoteTextLength : 1000;
});

const canPost = $computed((): boolean => {
	return !posting && !posted &&
		(1 <= textLength || 1 <= files.length || !!poll || !!props.renote) &&
		(textLength <= maxTextLength) &&
		(!poll || poll.choices.length >= 2);
});

const withHashtags = $computed(defaultStore.makeGetterSetter('postFormWithHashtags'));
const hashtags = $computed(defaultStore.makeGetterSetter('postFormHashtags'));

const pushVisibleUser = (user: misskey.entities.User): void => {
	if (!visibleUsers.some(u => u.username === user.username && u.host === user.host)) {
		visibleUsers.push(user);
	}
};

const addVisibleUser = (): void => {
	os.selectUser().then(user => {
		pushVisibleUser(user);

		if (!text.toLowerCase().includes(`@${user.username.toLowerCase()}`)) {
			text = `@${Acct.toString(user)} ${text}`;
		}
	});
};

const removeVisibleUser = (user: misskey.entities.User): void => {
	visibleUsers = erase(user, visibleUsers);
};

if (props.mention) {
	text = props.mention.host ? `@${props.mention.username}@${toASCII(props.mention.host)}` : `@${props.mention.username}`;
	text += ' ';
}

if (props.reply && (props.reply.user.username !== $i?.username || (props.reply.user.host != null && props.reply.user.host !== host))) {
	text = `@${props.reply.user.username}${props.reply.user.host != null ? '@' + toASCII(props.reply.user.host) : ''} `;
}

if (props.reply && props.reply.text != null) {
	const ast = mfm.parse(props.reply.text);
	const otherHost = props.reply.user.host;

	for (const x of extractMentions(ast)) {
		const mention = x.host ?
			`@${x.username}@${toASCII(x.host)}` :
			(otherHost == null || otherHost === host) ?
				`@${x.username}` :
				`@${x.username}@${toASCII(otherHost)}`;

		// 自分は除外
		if ($i?.username === x.username && (x.host == null || x.host === host)) continue;

		// 重複は除外
		if (text.includes(`${mention} `)) continue;

		text += `${mention} `;
	}
}

if (props.channel) {
	visibility = 'public';
	localOnly = true; // TODO: チャンネルが連合するようになった折には消す
}

// 公開以外へのリプライ時は元の公開範囲を引き継ぐ
if (props.reply && ['home', 'followers', 'specified'].includes(props.reply.visibility)) {
	if (props.reply.visibility === 'home' && visibility === 'followers') {
		visibility = 'followers';
	} else if (['home', 'followers'].includes(props.reply.visibility) && visibility === 'specified') {
		visibility = 'specified';
	} else {
		visibility = props.reply.visibility;
	}

	if (visibility === 'specified') {
		if (props.reply.visibleUserIds) {
			os.api('users/show', {
				userIds: props.reply.visibleUserIds.filter(uid => uid !== $i?.id && uid !== props.reply?.userId),
			}).then(users => {
				users.forEach(pushVisibleUser);
			});
		}

		if (props.reply.userId !== $i?.id) {
			os.api('users/show', { userId: props.reply.userId }).then(user => {
				pushVisibleUser(user);
			});
		}
	}
}

if (props.specified) {
	visibility = 'specified';
	pushVisibleUser(props.specified);
}

// keep cw when reply
if (defaultStore.state.keepCw && props.reply && props.reply.cw) {
	useCw = true;
	cw = props.reply.cw;
}

const chooseDraft = (): void => {
	new Promise<DraftWithId>(resolve => {
		os.popup(defineAsyncComponent(() => import('@/components/TmsDraftsList.vue')), {}, {
			chosen: (draft: DraftWithId) => {
				resolve(draft);
			},
		}, 'closed');
	}).then((draft: DraftWithId) => {
		draftKey = draft.id;
		text = draft.data.text;
		useCw = draft.data.useCw;
		cw = draft.data.cw;
		visibility = draft.data.visibility;
		localOnly = draft.data.localOnly;
		files = draft.data.files;
		poll = draft.data.poll;
	});
};

const watchForDraft = (): void => {
	watch($$(text), saveDraft);
	watch($$(useCw), saveDraft);
	watch($$(cw), saveDraft);
	watch($$(poll), saveDraft);
	watch($$(files), saveDraft, { deep: true });
	watch($$(visibility), saveDraft);
	watch($$(localOnly), saveDraft);
};

const checkMissingMention = (): void => {
	if (visibility === 'specified') {
		const ast = mfm.parse(text);

		for (const x of extractMentions(ast)) {
			if (!visibleUsers.some(u => (u.username === x.username) && (u.host === x.host))) {
				hasNotSpecifiedMentions = true;
				return;
			}
		}
		hasNotSpecifiedMentions = false;
	}
};

const addMissingMention = (): void => {
	const ast = mfm.parse(text);

	for (const x of extractMentions(ast)) {
		if (!visibleUsers.some(u => (u.username === x.username) && (u.host === x.host))) {
			os.api('users/show', { username: x.username, host: x.host ?? undefined }).then(user => {
				visibleUsers.push(user);
			});
		}
	}
};

const checkAnnoyingPost = (): void => {
	if (!useCw && visibility === 'public') {
		annoyingPost = (
			text.includes('$[x2') ||
			text.includes('$[x3') ||
			text.includes('$[x4') ||
			text.includes('$[scale') ||
			text.includes('$[position')
		);
	} else {
		annoyingPost = false;
	}
};

watch($$(text), checkMissingMention, { immediate: true });
watch($$(visibleUsers), checkMissingMention, { deep: true });

watch($$(text), checkAnnoyingPost);
watch($$(useCw), checkAnnoyingPost);
watch($$(visibility), checkAnnoyingPost);

const togglePoll = (): void => {
	if (poll) {
		poll = null;
	} else {
		poll = {
			choices: ['', ''],
			multiple: false,
			expiresAt: null,
			expiredAfter: null,
		};
	}
};

const addTag = (tag: string): void => {
	insertTextAtCursor(textareaEl, ` #${tag} `);
};

const focus = (): void => {
	if (textareaEl) {
		textareaEl.focus();
		textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
	}
};

const chooseFileFrom = (ev: MouseEvent): void => {
	selectFiles(ev.currentTarget ?? ev.target, i18n.ts.attachFile).then(files_ => {
		for (const file of files_) {
			files.push(file);
		}
	});
};

const detachFile = (id: string): void => {
	files = files.filter(x => x.id !== id);
};

const updateFiles = (_files: misskey.entities.DriveFile[]): void => {
	files = _files;
};

const updateFileSensitive = (file: misskey.entities.DriveFile, sensitive: boolean): void => {
	files[files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
};

const updateFileName = (file: misskey.entities.DriveFile, name: string): void => {
	files[files.findIndex(x => x.id === file.id)].name = name;
};

const upload = (file: File, name?: string): void => {
	uploadFile(file, defaultStore.state.uploadFolder, name).then(res => {
		files.push(res);
	});
};

const setVisibility = (): void => {
	if (props.channel) {
		visibility = 'public';
		localOnly = true; // TODO: チャンネルが連合するようになった折には消す
		return;
	}

	os.popup(defineAsyncComponent(() => import('@/components/MkVisibilityPicker.vue')), {
		currentVisibility: visibility,
		currentLocalOnly: localOnly,
		src: visibilityButton,
	}, {
		changeVisibility: (v: typeof visibility) => {
			visibility = v;
			if (defaultStore.state.rememberNoteVisibility) {
				defaultStore.set('visibility', visibility);
			}
		},
		changeLocalOnly: (v: typeof localOnly) => {
			localOnly = v;
			if (defaultStore.state.rememberNoteVisibility) {
				defaultStore.set('localOnly', localOnly);
			}
		},
	}, 'closed');
};

const clear = (): void => {
	text = '';
	files = [];
	poll = null;
	quoteId = null;
};

const onKeydown = (ev: KeyboardEvent): void => {
	typing();
	if (ev.isComposing || ev.key === 'Process' || ev.keyCode === 229) return;
	if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && canPost) post();
	if (ev.key === 'Escape' || ev.key === 'Esc') emit('esc');
};

const onCompositionUpdate = (ev: CompositionEvent): void => {
	typing();
	imeText = ev.data;
};

const onCompositionEnd = (_ev: CompositionEvent): void => {
	imeText = '';
};

const onPaste = async (ev: ClipboardEvent): Promise<void> => {
	if (!ev.clipboardData) return;

	Array.from(ev.clipboardData.items, (item, i) => {
		if (item.kind !== 'file') return;
		const file = item.getAsFile();
		if (!file) return;
		const lio = file.name.lastIndexOf('.');
		const ext = lio >= 0 ? file.name.slice(lio) : '';
		const formatted = `${formatTimeString(new Date(file.lastModified), defaultStore.state.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
		upload(file, formatted);
	});

	const paste = ev.clipboardData.getData('text');
	const path = url + '/notes/';

	if (!props.renote && !quoteId && paste.startsWith(path)) {
		ev.preventDefault();

		os.confirm({
			type: 'info',
			text: i18n.ts.quoteQuestion,
		}).then(({ canceled }) => {
			if (canceled) {
				insertTextAtCursor(textareaEl, paste);
				return;
			}

			quoteId = paste.slice((url + '/notes/').length).split(/[\/\?#]/, 1)[0] || null;
		});
	}
};

const onDragover = (ev: DragEvent): void => {
	if (!ev.dataTransfer?.items[0]) return;
	const isFile = ev.dataTransfer.items[0].kind === 'file';
	const isDriveFile = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FILE_;
	if (isFile || isDriveFile) {
		ev.preventDefault();
		draghover = true;
		switch (ev.dataTransfer.effectAllowed) {
			case 'all':
			case 'uninitialized':
			case 'copy':
			case 'copyLink':
			case 'copyMove':
				ev.dataTransfer.dropEffect = 'copy';
				break;
			case 'linkMove':
			case 'move':
				ev.dataTransfer.dropEffect = 'move';
				break;
			default:
				ev.dataTransfer.dropEffect = 'none';
				break;
		}
	}
};

const onDragenter = (_ev: DragEvent): void => {
	draghover = true;
};

const onDragleave = (_ev: DragEvent): void => {
	draghover = false;
};

const onDrop = (ev: DragEvent): void => {
	if (!ev.dataTransfer) return;
	draghover = false;

	// ファイルだったら
	if (ev.dataTransfer.files.length > 0) {
		ev.preventDefault();
		for (const x of Array.from(ev.dataTransfer.files)) upload(x);
		return;
	}

	//#region ドライブのファイル
	const driveFile = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
	if (driveFile) {
		const file = parseObject<misskey.entities.DriveFile>(driveFile);
		files.push(file);
		ev.preventDefault();
	}
	//#endregion
};

const saveDraft = (): void => _setDraft(draftKey, { text, useCw, cw, visibility, localOnly, files, poll });

const deleteDraft = (): void => _deleteDraft(draftKey);

const post = async (ev?: MouseEvent): Promise<void> => {
	if (ev) {
		const el = ev.currentTarget ?? ev.target;
		if (el instanceof HTMLElement) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			os.popup(MkRippleEffect, { x, y }, {}, 'end');
		}
	}

	let postData = {
		text: text === '' ? undefined : text,
		fileIds: files.length > 0 ? files.map(f => f.id) : undefined,
		replyId: props.reply ? props.reply.id : undefined,
		renoteId: props.renote ? props.renote.id : quoteId ? quoteId : undefined,
		channelId: props.channel ? props.channel.id : undefined,
		poll: poll,
		cw: useCw ? cw ?? '' : undefined,
		localOnly: localOnly,
		visibility: visibility,
		visibleUserIds: visibility === 'specified' ? visibleUsers.map(u => u.id) : undefined,
	};

	if (withHashtags && hashtags && hashtags.trim() !== '') {
		const hashtags_ = hashtags.trim().split(' ').map(x => x.startsWith('#') ? x : '#' + x).join(' ');
		postData.text = postData.text ? `${postData.text} ${hashtags_}` : hashtags_;
	}

	// plugin
	if (notePostInterruptors.length > 0) {
		for (const interruptor of notePostInterruptors) {
			postData = await interruptor.handler(deepClone(postData)) as typeof postData;
		}
	}

	let token = undefined;

	if (postAccount) {
		const storedAccounts = await getAccounts();
		token = storedAccounts.find(x => x.id === postAccount?.id)?.token;
	}

	posting = true;
	os.api('notes/create', postData, token).then(({ createdNote }) => {
		if (props.freezeAfterPosted) {
			posted = true;
		} else {
			clear();
		}
		nextTick(() => {
			deleteDraft();
			emit('posted');
			if (postData.text && postData.text !== '') {
				const hashtags_ = mfm.parse(postData.text).filter(x => x.type === 'hashtag').map(x => x.props.hashtag);
				const history = parseArray<string[]>(localStorage.getItem('hashtags'));
				localStorage.setItem('hashtags', JSON.stringify(unique(hashtags_.concat(history))));
			}
			posting = false;
			postAccount = null;

			imanonashi(createdNote);
		});
	}).catch(err => {
		posting = false;
		os.alert({
			type: 'error',
			text: err.message + '\n' + (err as any).id,
		});
	});
};

const cancel = (): void => {
	emit('cancel');
};

const insertMention = (): void => {
	os.selectUser().then(user => {
		insertTextAtCursor(textareaEl, '@' + Acct.toString(user) + ' ');
	});
};

const insertEmoji = async (ev: MouseEvent): Promise<void> => {
	const el = ev.currentTarget ?? ev.target;
	if (!(el instanceof HTMLElement)) return;
	os.openEmojiPicker(el, {}, textareaEl);
};

const showActions = (ev: MouseEvent): void => {
	const el = ev.currentTarget ?? ev.target;
	if (!(el instanceof HTMLElement)) return;
	os.popupMenu(postFormActions.map(action => ({
		text: action.title,
		action: (): void => {
			action.handler({
				text: text,
			}, (key, value) => {
				if (key === 'text') { text = value; }
			});
		},
	})), el);
};

let postAccount = $ref<misskey.entities.UserDetailed | null>(null);

const openAccountMenu = (ev: MouseEvent): void => {
	openAccountMenu_({
		withExtraOperation: false,
		includeCurrentAccount: true,
		active: postAccount != null ? postAccount.id : $i?.id,
		onChoose: (account) => {
			if (account.id === $i?.id) {
				postAccount = null;
			} else {
				postAccount = account;
			}
		},
	}, ev);
};

onMounted(() => {
	if (props.autofocus) {
		focus();

		nextTick(() => {
			focus();
		});
	}

	// TODO: detach when unmount
	new Autocomplete(textareaEl, $$(text));
	new Autocomplete(cwInputEl, $$(cw));
	new Autocomplete(hashtagsInputEl, $$(hashtags));

	nextTick(() => {
		// 書きかけの投稿を復元
		if (!props.instant && !props.mention && !props.specified) {
			const draft = _getDraft(draftKey);
			if (draft) {
				text = draft.data.text;
				useCw = draft.data.useCw;
				cw = draft.data.cw;
				visibility = draft.data.visibility;
				localOnly = draft.data.localOnly;
				files = draft.data.files;
				poll = draft.data.poll;
			}
		}

		// 削除して編集
		if (props.initialNote) {
			const init = props.initialNote;
			text = init.text ?? '';
			files = init.files;
			cw = init.cw;
			useCw = init.cw != null;
			if (init.poll) {
				poll = {
					choices: init.poll.choices.map(x => x.text),
					multiple: init.poll.multiple,
					expiresAt: init.poll.expiresAt,
					expiredAfter: init.poll.expiredAfter,
				};
			}
			visibility = init.visibility;
			localOnly = !!init.localOnly;
			quoteId = init.renote?.id ?? null;
		}

		nextTick(() => {
			saveDraft();
			watchForDraft();
		});
	});
});

defineExpose({
	clear,
});
</script>

<style lang="scss" module>
.root {
	position: relative;

	&.modal {
		width: 100%;
		max-width: 520px;
	}
}

//#region header
.header {
	z-index: 1000;
	min-height: 50px;
	display: flex;
	flex-wrap: nowrap;
	gap: 4px;
}

.headerLeft {
	display: grid;
	grid-template-columns: repeat(2, minmax(36px, 50px));
	grid-template-rows: minmax(40px, 100%);
}

.cancel {
	padding: 0;
	font-size: 1em;
	height: 100%;
}

.account {
	height: 100%;
	display: inline-flex;
	vertical-align: bottom;
}

.avatar {
	width: 28px;
	height: 28px;
	margin: auto 0;
}

.headerRight {
	display: flex;
	min-height: 48px;
	font-size: 0.9em;
	flex-wrap: nowrap;
	align-items: center;
	margin-left: auto;
	gap: 4px;
	overflow: clip;
	padding-left: 4px;
}

.submit {
	margin: 12px 12px 12px 6px;
	vertical-align: bottom;

	&:disabled {
		opacity: 0.7;
	}

	&.posting {
		cursor: wait;
	}

	&:not(:disabled):hover {
		> .inner {
			background: linear-gradient(90deg, var(--X8), var(--X8));
		}
	}

	&:not(:disabled):active {
		> .inner {
			background: linear-gradient(90deg, var(--X8), var(--X8));
		}
	}
}

.submitInner {
	padding: 0 12px;
	line-height: 34px;
	font-weight: bold;
	border-radius: 6px;
	min-width: 90px;
	box-sizing: border-box;
	color: var(--fgOnAccent);
	background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));
}

.headerRightItem {
	margin: 0;
	padding: 8px;
	border-radius: 6px;

	&:hover {
		background: var(--X5);
	}

	&:disabled {
		background: none;
	}
}

.headerRightButtonIcon:not(:first-child) {
	padding-left: 6px;
}

.headerRightButtonText {
	padding-left: 6px;
}

.visibility {
	overflow: clip;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:enabled {
		> .headerRightButtonText {
			opacity: 0.8;
		}
	}
}

.previewButtonActive {
	color: var(--accent);
}
//#endregion

.preview {
	padding: 16px 20px 0 20px;
}

.targetNote {
	padding: 0 20px 16px 20px;
}

.withQuote {
	margin: 0 0 8px 0;
	color: var(--accent);
}

.toSpecified {
	padding: 6px 24px;
	margin-bottom: 8px;
	overflow: auto;
	white-space: nowrap;
}

.visibleUsers {
	display: inline;
	top: -1px;
	font-size: 14px;
}

.visibleUser {
	margin-right: 14px;
	padding: 8px 0 8px 8px;
	border-radius: 8px;
	background: var(--X4);
}

.info {
	margin: 0 20px 8px 20px;

	&:last-child {
		margin-bottom: 16px;
	}
}

.cw,
.hashtags,
.text {
	display: block;
	box-sizing: border-box;
	padding: 0 24px;
	margin: 0;
	width: 100%;
	font-size: 16px;
	border: none;
	border-radius: 0;
	background: transparent;
	color: var(--fg);
	font-family: inherit;

	&:focus {
		outline: none;
	}

	&:disabled {
		opacity: 0.5;
	}
}

.cw {
	z-index: 1;
	padding-bottom: 8px;
	border-bottom: solid 0.5px var(--divider);
}

.hashtags {
	z-index: 1;
	padding-top: 8px;
	padding-bottom: 8px;
	border-top: solid 0.5px var(--divider);
}

.textOuter {
	width: 100%;
	position: relative;

	&.withCw {
		padding-top: 8px;
	}
}

.text {
	max-width: 100%;
	min-width: 100%;
	width: 100%;
	min-height: 90px;
	height: 100%;
}

.textCount {
	position: absolute;
	top: 0;
	right: 2px;
	padding: 4px 6px;
	font-size: .9em;
	color: var(--fg);
	border-radius: 6px;
	min-width: 1.6em;
	text-align: center;
	pointer-events: none;
	opacity: 0.8;

	&.textOver {
		color: var(--error);
	}
}

.footer {
	display: flex;
	padding: 0 16px 16px 16px;
	font-size: 1em;
}

.footerLeft {
	flex: 1;
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
	grid-auto-rows: 46px;
}

.footerRight {
	flex: 0.3;
	margin-left: auto;
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
	grid-auto-rows: 46px;
	direction: rtl;
}

.footerButton {
	display: inline-block;
	padding: 0;
	margin: 0;
	font-size: 1em;
	width: auto;
	height: 100%;
	border-radius: 6px;

	&:hover {
		background: var(--X5);
	}

	&.footerButtonActive {
		color: var(--accent);
	}
}

:global(.max-width_500px) {
	.headerRight {
		font-size: .9em;
	}

	.headerRightButtonText {
		display: none;
	}

	.visibility {
		overflow: initial;
	}

	.submit {
		margin: 8px 8px 8px 4px;
	}

	.toSpecified {
		padding: 6px 16px;
	}

	.preview {
		padding: 16px 14px 0 14px;
	}

	.cw,
	.hashtags,
	.text {
		padding: 0 16px;
	}

	.text {
		min-height: 80px;
	}

	.footer {
		padding: 0 8px 8px 8px;
	}
}

:global(.max-width_310px) {
	.headerRight {
		gap: 0;
	}

	.footer {
		font-size: 14px;
	}
}
</style>
