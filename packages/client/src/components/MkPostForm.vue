<template>
<div
	v-size="{ max: [310, 500] }" class="gafaadew"
	:class="{ modal, _popup: modal }"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header>
		<button v-if="!fixed" class="cancel _button" @click="cancel"><i class="ti ti-x"></i></button>
		<button v-click-anime v-tooltip="i18n.ts.switchAccount" class="account _button" @click="openAccountMenu">
			<MkAvatar :user="postAccount ?? $i" class="avatar"/>
		</button>
		<div class="right">
			<span class="text-count" :class="{ over: textLength > maxTextLength }">{{ maxTextLength - textLength }}</span>
			<span v-if="localOnly" class="local-only"><i class="ti ti-world-off"></i></span>
			<button ref="visibilityButton" v-tooltip="i18n.ts.visibility" class="_button visibility" :disabled="channel != null" @click="setVisibility">
				<span v-if="visibility === 'public'"><i class="ti ti-world"></i></span>
				<span v-if="visibility === 'home'"><i class="ti ti-home"></i></span>
				<span v-if="visibility === 'followers'"><i class="ti ti-lock"></i></span>
				<span v-if="visibility === 'specified'"><i class="ti ti-mail"></i></span>
			</button>
			<button v-tooltip="i18n.ts.previewNoteText" class="_button preview" :class="{ active: showPreview }" @click="showPreview = !showPreview"><i class="ti ti-eye"></i></button>
			<button class="submit _buttonGradate" :disabled="!canPost" data-cy-open-post-form-submit @click="post">{{ submitText }}<i :class="reply ? 'ti ti-arrow-back-up' : renote ? 'ti ti-quote' : 'ti ti-send'"></i></button>
		</div>
	</header>
	<div class="form" :class="{ fixed }">
		<XNoteSimple v-if="reply" class="preview" :note="reply"/>
		<XNoteSimple v-if="renote" class="preview" :note="renote"/>
		<div v-if="quoteId" class="with-quote"><i class="ti ti-quote"></i> {{ i18n.ts.quoteAttached }}<button @click="quoteId = null"><i class="ti ti-x"></i></button></div>
		<div v-if="visibility === 'specified'" class="to-specified">
			<span style="margin-right: 8px;">{{ i18n.ts.recipient }}</span>
			<div class="visibleUsers">
				<span v-for="u in visibleUsers" :key="u.id">
					<MkAcct :user="u"/>
					<button class="_button" @click="removeVisibleUser(u)"><i class="ti ti-x"></i></button>
				</span>
				<button class="_buttonPrimary" @click="addVisibleUser"><i class="ti ti-plus ti-fw"></i></button>
			</div>
		</div>
		<MkInfo v-if="hasNotSpecifiedMentions" warn class="info hasNotSpecifiedMentions">{{ i18n.ts.notSpecifiedMentionWarning }} - <button class="_textButton" @click="addMissingMention()">{{ i18n.ts.add }}</button></MkInfo>
		<MkInfo v-if="annoyingPost" warn class="info annoyingPost">{{ i18n.ts.thisPostMayBeAnnoying }}</MkInfo>
		<input v-show="useCw" ref="cwInputEl" v-model="cw" class="cw" :placeholder="i18n.ts.annotation" @keydown="onKeydown">
		<textarea ref="textareaEl" v-model="text" class="text" :class="{ withCw: useCw }" :disabled="posting" :placeholder="placeholder" data-cy-post-form-text @keydown="onKeydown" @paste="onPaste" @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd"/>
		<input v-show="withHashtags" ref="hashtagsInputEl" v-model="hashtags" class="hashtags" :placeholder="i18n.ts.hashtags" list="hashtags">
		<XPostFormAttaches class="attaches" :files="files" @updated="updateFiles" @detach="detachFile" @change-sensitive="updateFileSensitive" @change-name="updateFileName"/>
		<XPollEditor v-if="poll" v-model="poll" @destroyed="poll = null"/>
		<XNotePreview v-if="showPreview" class="preview" :text="text"/>
		<footer>
			<button v-tooltip="i18n.ts.attachFile" class="_button" @click="chooseFileFrom"><i class="ti ti-photo-plus"></i></button>
			<button v-tooltip="i18n.ts.poll" class="_button" :class="{ active: poll }" @click="togglePoll"><i class="ti ti-chart-arrows"></i></button>
			<button v-tooltip="i18n.ts.useCw" class="_button" :class="{ active: useCw }" @click="useCw = !useCw"><i class="ti ti-eye-off"></i></button>
			<button v-tooltip="i18n.ts.mention" class="_button" @click="insertMention"><i class="ti ti-at"></i></button>
			<button v-tooltip="i18n.ts.hashtags" class="_button" :class="{ active: withHashtags }" @click="withHashtags = !withHashtags"><i class="ti ti-hash"></i></button>
			<button v-tooltip="i18n.ts.emoji" class="_button" @click="insertEmoji"><i class="ti ti-mood-happy"></i></button>
			<button v-if="postFormActions.length > 0" v-tooltip="i18n.ts.plugin" class="_button" @click="showActions"><i class="ti ti-plug"></i></button>
		</footer>
		<datalist id="hashtags">
			<option v-for="hashtag in recentHashtags" :key="hashtag" :value="hashtag"/>
		</datalist>
	</div>
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
import XNoteSimple from '@/components/MkNoteSimple.vue';
import XNotePreview from '@/components/MkNotePreview.vue';
import XPostFormAttaches from '@/components/MkPostFormAttaches.vue';
import XPollEditor from '@/components/MkPollEditor.vue';
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

const modal = inject('modal');

const props = withDefaults(defineProps<{
	reply?: misskey.entities.Note;
	renote?: misskey.entities.Note;
	channel?: any; // TODO
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
}>(), {
	initialVisibleUsers: () => [],
	autofocus: true,
});

const emit = defineEmits<{
	(ev: 'posted'): void;
	(ev: 'cancel'): void;
	(ev: 'esc'): void;
}>();

const textareaEl = $ref<HTMLTextAreaElement | null>(null);
const cwInputEl = $ref<HTMLInputElement | null>(null);
const hashtagsInputEl = $ref<HTMLInputElement | null>(null);
const visibilityButton = $ref<HTMLElement | null>(null);

let posting = $ref(false);
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
let autocomplete = $ref(null);
let draghover = $ref(false);
let quoteId: string | null = $ref(null);
let hasNotSpecifiedMentions = $ref(false);
let annoyingPost = $ref(false);
let recentHashtags = $ref(parseArray<string[]>(localStorage.getItem('hashtags')));
let imeText = $ref('');

const typing = throttle(3000, () => {
	if (props.channel) {
		stream.send('typingOnChannel', { channel: props.channel.id });
	}
});

const draftKey = $computed((): string => {
	let key = props.channel ? `channel:${props.channel.id}` : '';

	if (props.renote) {
		key += `renote:${props.renote.id}`;
	} else if (props.reply) {
		key += `reply:${props.reply.id}`;
	} else {
		key += 'note';
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
	return !posting &&
		(1 <= textLength || 1 <= files.length || !!poll || !!props.renote) &&
		(textLength <= maxTextLength) &&
		(!poll || poll.choices.length >= 2);
});

const withHashtags = $computed(defaultStore.makeGetterSetter('postFormWithHashtags'));
const hashtags = $computed(defaultStore.makeGetterSetter('postFormHashtags'));

watch($$(text), () => {
	checkMissingMention();
});

watch($$(visibleUsers), () => {
	checkMissingMention();
}, {
	deep: true,
});

watch($$(text), () => checkAnnoyingPost());
watch($$(useCw), () => checkAnnoyingPost());
watch($$(visibility), () => checkAnnoyingPost());

const pushVisibleUser = (user: misskey.entities.User): void => {
	if (!visibleUsers.some(u => u.username === user.username && u.host === user.host)) {
		visibleUsers.push(user);
	}
};

const addVisibleUser = (): void => {
	os.selectUser().then(user => {
		pushVisibleUser(user);
	});
};

const removeVisibleUser = (user: misskey.entities.User): void => {
	visibleUsers = erase(user, visibleUsers);
};

if (props.initialVisibleUsers) {
	props.initialVisibleUsers.forEach(pushVisibleUser);
}

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
	visibility = props.reply.visibility;
	if (props.reply.visibility === 'specified') {
		os.api('users/show', {
			userIds: props.reply.visibleUserIds?.filter(uid => uid !== $i?.id && uid !== props.reply?.userId) ?? [],
		}).then(users => {
			users.forEach(pushVisibleUser);
		});

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

const watchForDraft = (): void => {
	watch($$(text), () => saveDraft());
	watch($$(useCw), () => saveDraft());
	watch($$(cw), () => saveDraft());
	watch($$(poll), () => saveDraft());
	watch($$(files), () => saveDraft(), { deep: true });
	watch($$(visibility), () => saveDraft());
	watch($$(localOnly), () => saveDraft());
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
		// TODO: information dialog
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
	if ((ev.which === 10 || ev.which === 13) && (ev.ctrlKey || ev.metaKey) && canPost) post();
	if (ev.which === 27) emit('esc');
	typing();
};

const onCompositionUpdate = (ev: CompositionEvent): void => {
	imeText = ev.data;
	typing();
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

type DraftData = {
	updatedAt: string;
	data: {
		text: typeof text;
		useCw: typeof useCw;
		cw: typeof cw;
		visibility: typeof visibility;
		localOnly: typeof localOnly;
		files: typeof files;
		poll: typeof poll;
	};
};

const saveDraft = (): void => {
	const draftData = parseObject<Record<string, DraftData>>(localStorage.getItem('drafts'));

	draftData[draftKey] = {
		updatedAt: new Date().toJSON(),
		data: {
			text: text,
			useCw: useCw,
			cw: cw,
			visibility: visibility,
			localOnly: localOnly,
			files: files,
			poll: poll,
		},
	};

	localStorage.setItem('drafts', JSON.stringify(draftData));
};

const deleteDraft = (): void => {
	const draftData = parseObject<Record<string, DraftData>>(localStorage.getItem('drafts'));

	delete draftData[draftKey];

	localStorage.setItem('drafts', JSON.stringify(draftData));
};

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
		cw: useCw ? cw || '' : undefined,
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
		clear();
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
			const draft = parseObject<Record<string, DraftData | undefined>>(localStorage.getItem('drafts'))[draftKey];
			if (draft) {
				text = draft.data.text;
				useCw = draft.data.useCw;
				cw = draft.data.cw;
				visibility = draft.data.visibility;
				localOnly = draft.data.localOnly;
				files = (draft.data.files || []).filter(draftFile => draftFile);
				if (draft.data.poll) {
					poll = draft.data.poll;
				}
			}
		}

		// 削除して編集
		if (props.initialNote) {
			const init = props.initialNote;
			text = init.text ? init.text : '';
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
			localOnly = init.localOnly;
			quoteId = init.renote ? init.renote.id : null;
		}

		nextTick(() => watchForDraft());
	});
});
</script>

<style lang="scss" scoped>
.gafaadew {
	position: relative;

	&.modal {
		width: 100%;
		max-width: 520px;
	}

	> header {
		z-index: 1000;
		height: 66px;

		> .cancel {
			padding: 0;
			font-size: 1em;
			width: 64px;
			line-height: 66px;
		}

		> .account {
			height: 100%;
			aspect-ratio: 1/1;
			display: inline-flex;
			vertical-align: bottom;

			> .avatar {
				width: 28px;
				height: 28px;
				margin: auto;
			}
		}

		> .right {
			position: absolute;
			top: 0;
			right: 0;

			> .text-count {
				opacity: 0.7;
				line-height: 66px;

				&.over {
					color: var(--error);
				}
			}

			> .visibility {
				height: 34px;
				width: 34px;
				margin: 0 0 0 8px;

				& + .localOnly {
					margin-left: 0 !important;
				}
			}
			
			> .local-only {
				margin: 0 0 0 12px;
				opacity: 0.7;
			}

			> .preview {
				display: inline-block;
				padding: 0;
				margin: 0 8px 0 0;
				font-size: 16px;
				width: 34px;
				height: 34px;
				border-radius: 6px;

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}
			}

			> .submit {
				margin: 16px 16px 16px 0;
				padding: 0 12px;
				line-height: 34px;
				font-weight: bold;
				vertical-align: bottom;
				border-radius: 4px;
				font-size: 0.9em;

				&:disabled {
					opacity: 0.7;
				}

				> i {
					margin-left: 6px;
				}
			}
		}
	}

	> .form {
		> .preview {
			padding: 16px;
		}

		> .with-quote {
			margin: 0 0 8px 0;
			color: var(--accent);

			> button {
				padding: 4px 8px;
				color: var(--accentAlpha04);

				&:hover {
					color: var(--accentAlpha06);
				}

				&:active {
					color: var(--accentDarken30);
				}
			}
		}

		> .to-specified {
			padding: 6px 24px;
			margin-bottom: 8px;
			overflow: auto;
			white-space: nowrap;

			> .visibleUsers {
				display: inline;
				top: -1px;
				font-size: 14px;

				> button {
					padding: 4px;
					border-radius: 8px;
				}

				> span {
					margin-right: 14px;
					padding: 8px 0 8px 8px;
					border-radius: 8px;
					background: var(--X4);

					> button {
						padding: 4px 8px;
					}
				}
			}
		}

		> .info {
			margin: 0 20px 8px 20px;

			&:last-child {
				margin-bottom: 16px;
			}
		}

		> .cw,
		> .hashtags,
		> .text {
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

		> .cw {
			z-index: 1;
			padding-bottom: 8px;
			border-bottom: solid 0.5px var(--divider);
		}

		> .hashtags {
			z-index: 1;
			padding-top: 8px;
			padding-bottom: 8px;
			border-top: solid 0.5px var(--divider);
		}

		> .text {
			max-width: 100%;
			min-width: 100%;
			min-height: 90px;

			&.withCw {
				padding-top: 8px;
			}
		}

		> footer {
			padding: 0 16px 16px 16px;

			> button {
				display: inline-block;
				padding: 0;
				margin: 0;
				font-size: 1em;
				width: 46px;
				height: 46px;
				border-radius: 6px;

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}
			}
		}
	}

	&.max-width_500px {
		> header {
			height: 50px;

			> .cancel {
				width: 50px;
				line-height: 50px;
			}

			> .right {
				> .text-count {
					line-height: 50px;
				}

				> .submit {
					margin: 8px;
				}
			}
		}

		> .form {
			> .to-specified {
				padding: 6px 16px;
			}

			> .cw,
			> .hashtags,
			> .text {
				padding: 0 16px;
			}

			> .text {
				min-height: 80px;
			}

			> footer {
				padding: 0 8px 8px 8px;
			}
		}
	}

	&.max-width_310px {
		> .form {
			> footer {
				> button {
					font-size: 14px;
					width: 44px;
				height: 44px;
				}
			}
		}
	}
}
</style>
