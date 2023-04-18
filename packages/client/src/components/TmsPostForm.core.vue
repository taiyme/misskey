<template>
<div
	ref="rootEl"
	v-size="{ max: [310, 500] }"
	:class="[$style.root, { [$style.modal]: modal, _popup: modal }]"
	:style="{ '--tmsPostForm-counterWidth': `${textCountElWidth}px` }"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header :class="$style.header">
		<div :class="$style.headerLeft">
			<button v-if="!fixed" :class="['_button', $style.cancel]" @click="cancel">
				<i class="ti ti-x"></i>
			</button>
			<button v-tooltip="i18n.ts.switchAccount" :class="['_button', $style.account]" @click="openAccountMenu">
				<MkAvatar :user="postAccount ?? ($i as any)" :class="$style.avatar"/>
			</button>
		</div>
		<div :class="$style.headerRight">
			<button v-if="!channel && !fixed" v-tooltip="i18n.ts._tms.drafts" :class="['_button', $style.headerRightButton]" @click="chooseDraft">
				<span><i class="ti ti-notes"></i></span>
			</button>
			<template v-if="!(channel && fixed)">
				<button v-tooltip="i18n.ts._visibility.disableFederation" :class="['_button', $style.headerRightButton]" :disabled="!!channel || visibility === 'specified'" @click="toggleLocalOnly">
					<span v-if="!localOnly"><i class="ti ti-rocket"></i></span>
					<span v-else><i class="ti ti-rocket-off" style="color: var(--error);"></i></span>
				</button>
				<button ref="visibilityButton" v-tooltip="i18n.ts.visibility" :class="['_button', $style.headerRightButton]" :disabled="!!channel" @click="openVisibilityPicker">
					<template v-if="!channel">
						<span v-if="visibility === 'public'"><i class="ti ti-world"></i></span>
						<span v-if="visibility === 'home'"><i class="ti ti-home"></i></span>
						<span v-if="visibility === 'followers'"><i class="ti ti-lock"></i></span>
						<span v-if="visibility === 'specified'"><i class="ti ti-mail"></i></span>
						<span :class="$style.headerRightButtonText">{{ i18n.ts._visibility[visibility] }}</span>
					</template>
					<template v-else>
						<span><i class="ti ti-device-tv"></i></span>
						<span :class="$style.headerRightButtonText">{{ (channel as any).name }}</span>
					</template>
				</button>
			</template>
			<button v-tooltip="i18n.ts.previewNoteText" :class="['_button', $style.headerRightButton, { [$style.headerRightButtonActive]: showPreview }]" @click="togglePreview">
				<span><i class="ti ti-eye"></i></span>
			</button>
			<button :class="['_button', $style.submit, { [$style.submitPosting]: posting }]" :disabled="!canPost" data-cy-open-post-form-submit @click="post">
				<div :class="$style.submitInner">
					<template v-if="posted"></template>
					<template v-else-if="posting"><MkEllipsis/></template>
					<template v-else>{{ (renote || quote) ? i18n.ts.quote : reply ? i18n.ts.reply : i18n.ts.note }}</template>
					<i :style="{ marginLeft: !posted ? '6px' : undefined }" class="ti" :class="posted ? 'ti-check' : reply ? 'ti-arrow-back-up' : (renote || quote) ? 'ti-quote' : 'ti-send'"></i>
				</div>
			</button>
		</div>
	</header>
	<MkNoteSimple v-if="reply" :class="$style.replyNote" :note="reply"/>
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
	<div :class="$style.infoList">
		<MkInfo v-if="hasNotSpecifiedMentions" warn>{{ i18n.ts.notSpecifiedMentionWarning }}<span style="margin: 0 4px; user-select: none;">-</span><button class="_textButton" @click="addMissingMention">{{ i18n.ts.add }}</button></MkInfo>
		<MkInfo v-if="hasAnnoyingText" warn>{{ i18n.ts.thisPostMayBeAnnoying }}</MkInfo>
	</div>
	<div :class="$style.forms">
		<input v-show="useCw" ref="cwInputEl" v-model="cw" :class="[$style.input, $style.cw]" :placeholder="i18n.ts.annotation" @keydown="onKeydown">
		<div :class="$style.textOuter">
			<textarea ref="textareaEl" v-model="text" :class="[$style.input, $style.text, { [$style.withCw]: useCw }]" :disabled="posting || posted" :placeholder="placeholder" data-cy-post-form-text @keydown="onKeydown" @paste="onPaste" @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd"></textarea>
			<div v-if="renote || quote" :class="$style.quote">
				<div :class="[$style.quoteInner, { [$style.hasQuoteCancel]: quote }]">
					<MkNoteSimple v-if="renote" :note="renote"/>
					<MkNoteSimple v-if="quote" :note="quote"/>
					<button v-if="quote" :class="['_button', $style.quoteCancel]" @click="quote = null"><i class="ti ti-x"></i></button>
				</div>
			</div>
			<div ref="textCountEl" :class="[$style.textCount, { [$style.textOver]: textLength > maxTextLength }]">{{ maxTextLength - textLength }}</div>
		</div>
		<input v-show="withHashtags" ref="hashtagsInputEl" v-model="hashtags" :class="[$style.input, $style.hashtags]" :placeholder="i18n.ts.hashtags" list="hashtags">
	</div>
	<MkPostFormAttaches :files="files" @updated="updateFiles" @detach="detachFile" @change-sensitive="updateFileSensitive" @change-name="updateFileName"/>
	<MkPollEditor v-if="poll" v-model="poll" @destroyed="poll = null"/>
	<MkNotePreview v-if="showPreview" :class="$style.preview" :text="text"/>
	<footer :class="$style.footer">
		<button v-tooltip="i18n.ts.attachFile" :class="['_button', $style.footerButton]" @click="chooseFileFrom"><i class="ti ti-photo-plus"></i></button>
		<button v-tooltip="i18n.ts.poll" :class="['_button', $style.footerButton, { [$style.footerButtonActive]: poll }]" @click="togglePoll"><i class="ti ti-chart-arrows"></i></button>
		<button v-tooltip="i18n.ts.useCw" :class="['_button', $style.footerButton, { [$style.footerButtonActive]: useCw }]" @click="toggleUseCw"><i class="ti ti-eye-off"></i></button>
		<button v-tooltip="i18n.ts.mention" :class="['_button', $style.footerButton]" @click="insertMention"><i class="ti ti-at"></i></button>
		<button v-tooltip="i18n.ts.hashtags" :class="['_button', $style.footerButton, { [$style.footerButtonActive]: withHashtags }]" @click="toggleWithHashtags"><i class="ti ti-hash"></i></button>
		<button v-if="postFormActions.length > 0" v-tooltip="i18n.ts.plugin" :class="['_button', $style.footerButton]" @click="showActions"><i class="ti ti-plug"></i></button>
		<button v-tooltip="i18n.ts.emoji" :class="['_button', $style.footerButton]" @click="insertEmoji"><i class="ti ti-mood-happy"></i></button>
	</footer>
	<datalist id="hashtags">
		<option v-for="hashtag in recentHashtags" :key="hashtag" :value="hashtag"/>
	</datalist>
</div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, inject, watch, defineAsyncComponent } from 'vue';
import * as Misskey from 'misskey-js';
import * as Acct from 'misskey-js/built/acct';
import * as mfm from 'mfm-js';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode/';
import { throttle } from 'throttle-debounce';
import { v4 as uuid } from 'uuid';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { stream } from '@/stream';
import { host as Host, url } from '@/config';
import { instance } from '@/instance';
import { defaultStore, notePostInterruptors, postFormActions } from '@/store';
import { $i, getAccounts, openAccountMenu as openAccountMenu_ } from '@/account';
import { extractMentions } from '@/scripts/extract-mentions';
import { Autocomplete } from '@/scripts/autocomplete';
import { selectFiles } from '@/scripts/select-file';
import { uploadFile } from '@/scripts/upload';
import { erase, unique } from '@/scripts/array';
import { deepClone } from '@/scripts/clone';
import { parseObject, parseArray } from '@/scripts/tms/parse';
import * as Draft from '@/scripts/tms/drafts';
import { imanonashi } from '@/scripts/tms/imanonashi';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';
import MkInfo from '@/components/MkInfo.vue';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkNotePreview from '@/components/MkNotePreview.vue';
import MkPostFormAttaches from '@/components/MkPostFormAttaches.vue';
import MkPollEditor, { EditedPoll } from '@/components/MkPollEditor.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';

//#region define
const props = withDefaults(defineProps<{
	draft: Draft.Draft | null;
	reply: Misskey.entities.Note | null;
	renote: Misskey.entities.Note | null;
	channel: Misskey.entities.Channel | null;
	mention: Misskey.entities.User | null;
	specified: Misskey.entities.User | null;
	initialText: string | null;
	initialVisibility: Misskey.entities.Note['visibility'] | null;
	initialFiles: Misskey.entities.DriveFile[] | null;
	initialLocalOnly: boolean | null;
	initialVisibleUsers: Misskey.entities.User[] | null;
	instant: boolean | null;
	fixed: boolean | null;
	autofocus: boolean | null;
	freezeAfterPosted: boolean | null;
}>(), {
	draft: null,
	reply: null,
	renote: null,
	channel: null,
	mention: null,
	specified: null,
	initialText: null,
	initialVisibility: null,
	initialFiles: null,
	initialLocalOnly: null,
	initialVisibleUsers: null,
	instant: null,
	fixed: null,
	autofocus: true,
	freezeAfterPosted: null,
});

const emit = defineEmits<{
	(ev: 'posted'): void;
	(ev: 'cancel'): void;
	(ev: 'esc'): void;
	(ev: 'reopen', draft?: Draft.Draft | null): void;
}>();

const modal = inject<boolean>('modal', false);

let fetchingList = $ref<string[]>([]);
const fetchingWrapper = <T>(prom: Promise<T>): Promise<T> => {
	const id = uuid();
	fetchingList.push(id);

	prom.finally(() => {
		fetchingList = fetchingList.filter(fid => fid !== id);
	});

	return prom;
};
const fetching = $computed<boolean>(() => fetchingList.length !== 0);

const isFetching = (): boolean => fetching;

defineExpose({
	isFetching,
});
//#endregion

//#region params, flags
let text = $ref<string>(props.initialText ?? '');
let useCw = $ref<boolean>(false);
let cw = $ref<string>('');
let visibility = $ref<Misskey.entities.Note['visibility']>(props.initialVisibility ?? (defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility));
let localOnly = $ref<boolean>(props.initialLocalOnly ?? (defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly));
let files = $ref<Misskey.entities.DriveFile[]>(props.initialFiles ?? []);
let poll = $ref<EditedPoll | null>(null);

let visibleUsers = $ref<Misskey.entities.User[]>([]);
const reply = $ref<Misskey.entities.Note | null>(props.reply);
const renote = $ref<Misskey.entities.Note | null>(props.renote);
const channel = $ref<Misskey.entities.Channel | null>(props.channel);

let quote = $ref<Misskey.entities.Note | null>(null);
const setQuote = (quoteId?: string | null): void => {
	if (!quoteId || renote) {
		quote = null;
		return;
	}

	fetchingWrapper(
		os.api('notes/show', { noteId: quoteId }, token)
			.then(_quote => quote = _quote)
			.catch(() => quote = null),
	);
};

let withHashtags = $ref<boolean>(defaultStore.state.postFormWithHashtags);
const hashtags = $computed<string>(defaultStore.makeGetterSetter('postFormHashtags'));
const recentHashtags = $ref(parseArray<string[]>(localStorage.getItem('hashtags')));

let imeText = $ref('');

let showPreview = $ref(false);

let posting = $ref(false);
let posted = $ref(false);

const clear = (): void => {
	text = '';
	files = [];
	poll = null;
	quote = null;
};

const placeholder = $computed((): string => {
	if (renote || quote) return i18n.ts._postForm.quotePlaceholder;
	if (reply) return i18n.ts._postForm.replyPlaceholder;
	if (channel) return i18n.ts._postForm.channelPlaceholder;
	const xs = [
		i18n.ts._postForm._placeholders.a,
		i18n.ts._postForm._placeholders.b,
		i18n.ts._postForm._placeholders.c,
		i18n.ts._postForm._placeholders.d,
		i18n.ts._postForm._placeholders.e,
		i18n.ts._postForm._placeholders.f,
	];
	return xs[Math.floor(Math.random() * xs.length)];
});

const textLength = $computed((): number => {
	return length((text + imeText).trim());
});

const maxTextLength = $computed((): number => {
	const instanceTyped = instance as {
		maxNoteTextLength?: number;
	} | null | undefined;
	return instanceTyped?.maxNoteTextLength ?? 1000;
});

const canPost = $computed((): boolean => {
	return !fetching && !posting && !posted &&
		(1 <= textLength || 1 <= files.length || !!poll || !!(renote || quote)) &&
		(textLength <= maxTextLength) &&
		(!poll || poll.choices.length >= 2);
});

// 宛先
let hasNotSpecifiedMentions = $ref(false);

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
			fetchingWrapper(
				os.api('users/show', { username: x.username, host: x.host ?? undefined }, token).then(user => {
					visibleUsers.push(user);
				}),
			);
		}
	}
};

watch($$(text), checkMissingMention, { immediate: true });
watch($$(visibility), checkMissingMention);
watch($$(visibleUsers), checkMissingMention, { deep: true });

// MFM
let hasAnnoyingText = $ref(false);

const checkAnnoyingText = (): void => {
	if (!useCw && visibility === 'public') {
		hasAnnoyingText = (
			text.includes('$[x2') ||
			text.includes('$[x3') ||
			text.includes('$[x4') ||
			text.includes('$[scale') ||
			text.includes('$[position')
		);
	} else {
		hasAnnoyingText = false;
	}
};

watch($$(text), checkAnnoyingText, { immediate: true });
watch($$(useCw), checkAnnoyingText);
watch($$(visibility), checkAnnoyingText);
//#endregion

//#region draft
const draft = $ref<Draft.Draft | null>(props.draft);
const draftKey = $computed<string | null>(() => {
	if (draft) return draft.id;
	return Draft.genDraftId({
		user: $i,
		reply,
		renote,
		channel,
	});
});

const saveDraft = (): void => {
	Draft.setDraft(draftKey, {
		text,
		useCw,
		cw,
		visibility,
		localOnly,
		files,
		poll,
		replyId: reply?.id ?? null,
		renoteId: renote?.id ?? null,
		channelId: channel?.id ?? null,
		quoteId: quote?.id ?? null,
	});
};

const deleteDraft = (): void => {
	Draft.deleteDraft(draftKey);
};

const watchForDraft = (): void => {
	watch([
		$$(text),
		$$(useCw),
		$$(cw),
		$$(visibility),
		$$(localOnly),
		$$(files),
		$$(poll),
		$$(quote),
	], saveDraft, { deep: true });
};
//#endregion

//#region credential
let postAccount = $ref<Misskey.entities.UserDetailed | null>(null);
let token = $ref<string | null>(null);
const updatePostAccount = async (newPostAccount: Misskey.entities.UserDetailed | null): Promise<void> => {
	if (!newPostAccount || $i?.id === newPostAccount.id) {
		postAccount = null;
		token = null;
		return;
	}
	if (postAccount && (postAccount.id === newPostAccount.id)) return;

	type StoredAccount = {
		id: string;
		token: string;
	};

	const storedAccounts = (await getAccounts()) as StoredAccount[];
	const newToken = storedAccounts.find(x => x.id === newPostAccount.id)?.token ?? null;

	if (!newToken) {
		postAccount = null;
		token = null;
		return;
	}

	postAccount = newPostAccount;
	token = newToken;
};
//#endregion

//#region elements
const rootEl = $shallowRef<HTMLElement | null>(null);
const visibilityButton = $shallowRef<HTMLElement | null>(null);
const cwInputEl = $shallowRef<HTMLInputElement | null>(null);
const textareaEl = $shallowRef<HTMLTextAreaElement | null>(null);
const textCountEl = $shallowRef<HTMLElement | null>(null);
const hashtagsInputEl = $shallowRef<HTMLInputElement | null>(null);

let cwInputElAutocomplete: Autocomplete | null = null;
let textareaElAutocomplete: Autocomplete | null = null;
let hashtagsInputElAutocomplete: Autocomplete | null = null;

let textCountElResizeObserver: ResizeObserver | null = null;
let textCountElWidth = $ref(0);

const focus = (): void => {
	if (textareaEl) {
		textareaEl.focus();
		textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
	}
};

onMounted(() => {
	if (cwInputEl) {
		cwInputElAutocomplete = new Autocomplete(cwInputEl, $$(cw));
	}
	if (textareaEl) {
		textareaElAutocomplete = new Autocomplete(textareaEl, $$(text));
	}
	if (hashtagsInputEl) {
		hashtagsInputElAutocomplete = new Autocomplete(hashtagsInputEl, $$(hashtags));
	}
	if (textCountEl) {
		textCountElResizeObserver = new ResizeObserver(entries => {
			entries.forEach(({ borderBoxSize }) => {
				borderBoxSize.forEach(({ inlineSize }) => {
					const width = Math.ceil(inlineSize);
					textCountElWidth = width + (width % 2);
				});
			});
		});
		textCountElResizeObserver.observe(textCountEl);
	}
	if (props.autofocus) {
		focus();
		nextTick(focus);
	}

	nextTick(() => {
		if (!props.instant && !props.fixed) {
			const _draft = draft ?? Draft.getDraft(draftKey);
			if (_draft) {
				text = _draft.data.text;
				useCw = _draft.data.useCw;
				cw = _draft.data.cw;
				visibility = _draft.data.visibility;
				localOnly = _draft.data.localOnly;
				files = _draft.data.files;
				poll = _draft.data.poll;
				setQuote(_draft.data.quoteId);
			}
		}

		watchForDraft();
	});
});

onUnmounted(() => {
	if (cwInputElAutocomplete) {
		cwInputElAutocomplete.detach();
		cwInputElAutocomplete = null;
	}
	if (textareaElAutocomplete) {
		textareaElAutocomplete.detach();
		textareaElAutocomplete = null;
	}
	if (hashtagsInputElAutocomplete) {
		hashtagsInputElAutocomplete.detach();
		hashtagsInputElAutocomplete = null;
	}
	if (textCountElResizeObserver) {
		textCountElResizeObserver.disconnect();
		textCountElResizeObserver = null;
	}
});
//#endregion

//#region visibleUser
const pushVisibleUser = (user: Misskey.entities.User): void => {
	if (!visibleUsers.some(u => u.username === user.username && u.host === user.host)) {
		visibleUsers.push(user);
	}
};

const addVisibleUser = (): void => {
	fetchingWrapper(
		os.selectUser().then(user => {
			pushVisibleUser(user);

			if (!text.toLowerCase().includes(`@${user.username.toLowerCase()}`)) {
				text = `@${Acct.toString(user)} ${text}`;
			}
		}),
	);
};

const removeVisibleUser = (user: Misskey.entities.User): void => {
	visibleUsers = erase(user, visibleUsers);
};
//#endregion

//#region files
// const upload = async (file: File): Promise<void> => {
// 	return await fetchingWrapper(
// 		uploadFile(file, defaultStore.state.uploadFolder)
// 			.then(driveFile => {
// 				files.push(driveFile);
// 			}),
// 	);
// };

const uploads = async (fileList: File[]): Promise<void> => {
	return await fetchingWrapper(
		Promise.all(fileList.map(file => uploadFile(file, defaultStore.state.uploadFolder)))
			.then(driveFiles => {
				files.push(...driveFiles);
			}),
	);
};

const detachFile = (id: string): void => {
	files = files.filter(x => x.id !== id);
};

const updateFiles = (_files: Misskey.entities.DriveFile[]): void => {
	files = _files;
};

const updateFileSensitive = (file: Misskey.entities.DriveFile, sensitive: boolean): void => {
	files[files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
};

const updateFileName = (file: Misskey.entities.DriveFile, name: string): void => {
	files[files.findIndex(x => x.id === file.id)].name = name;
};
//#endregion

//#region init
// メンションの引き継ぎ
const parseMention = ({ username, host }: {
	username: string;
	host?: string | null;
}): string => {
	if (host == null || host === Host) {
		return `@${username}`;
	}
	return `@${username}@${toASCII(host)}`;
};

const addMention = ({ username, host }: {
	username: string;
	host?: string | null;
}): void => {
	const mention = parseMention({ username, host });

	if ($i?.username === username && (host == null || host === Host)) return;
	if (text.includes(`${mention} `)) return;

	text += `${mention} `;
};

if (text === '') {
	if (props.mention) {
		addMention({
			username: props.mention.username,
			host: props.mention.host,
		});
	}

	if (reply) {
		addMention({
			username: reply.user.username,
			host: reply.user.host,
		});
	}

	if (reply && reply.text) {
		const ast = mfm.parse(reply.text);

		for (const x of extractMentions(ast)) addMention(x);
	}
}

// 公開範囲の引き継ぎ
if (reply) {
	if (reply.visibility !== 'specified') {
		visibleUsers = [];

		if (visibility === 'public' && reply.visibility === 'home') {
			visibility = 'home';
		}
		if (visibility === 'home' && reply.visibility === 'followers') {
			visibility = 'followers';
		}
	} else {
		visibility = 'specified';
		localOnly = false;

		const visibleUserIds = reply.visibleUserIds?.filter(uid => uid !== $i?.id && uid !== reply?.userId) ?? [];
		if (visibleUserIds.length === 0) {
			visibleUsers = [];
		} else {
			fetchingWrapper(
				os.api('users/show', { userIds: visibleUserIds }, token)
					.then(users => {
						users.forEach(user => {
							pushVisibleUser(user);
						});
					}),
			);
		}
	}
}

if (props.specified) {
	visibility = 'specified';
	pushVisibleUser(props.specified);
}

if (channel) {
	visibility = 'public';
	localOnly = true;
}

if (defaultStore.state.keepCw && reply && reply.cw) {
	useCw = true;
	cw = reply.cw;
}
//#endregion

//#region handler (drag, drop)
// let draghover = $ref(false);

const onDragover = (ev: DragEvent): void => {
	if (!ev.dataTransfer?.items[0]) return;

	const isFile = ev.dataTransfer.items[0].kind === 'file';
	const isDriveFile = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FILE_;

	if (isFile || isDriveFile) {
		ev.preventDefault();

		// draghover = true;

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
	// draghover = true;
};

const onDragleave = (_ev: DragEvent): void => {
	// draghover = false;
};

const onDrop = (ev: DragEvent): void => {
	if (!ev.dataTransfer) return;

	// draghover = false;

	// File
	if (ev.dataTransfer.files.length > 0) {
		ev.preventDefault();
		uploads(Array.from(ev.dataTransfer.files));
		return;
	}

	// DriveFile
	const driveFile = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
	if (driveFile) {
		const file = parseObject<Misskey.entities.DriveFile>(driveFile);
		files.push(file);
		ev.preventDefault();
	}
};
//#endregion

//#region handler (keydown, ime, paste)
const typing = throttle(3000, () => {
	if (channel) {
		stream.send('typingOnChannel', { channel: channel.id });
	}
});

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

	uploads(
		Array.from(ev.clipboardData.items).flatMap(item => {
			if (item.kind !== 'file') return [];
			const file = item.getAsFile();
			if (!file) return [];
			return [file];
		}),
	);

	const paste = ev.clipboardData.getData('text');
	const path = `${url}/notes/`;

	if (!renote && !quote && paste.startsWith(path)) {
		ev.preventDefault();

		fetchingWrapper(
			os.confirm({
				type: 'info',
				text: i18n.ts.quoteQuestion,
			}).then(({ canceled }) => {
				if (canceled) {
					insertTextAtCursor(textareaEl, paste);
					return;
				}

				const quoteId = paste.slice(path.length).split(/[\/\?#]/, 1)[0] || null;
				setQuote(quoteId);
			}),
		);
	}
};
//#endregion

//#region header buttons
const cancel = (): void => {
	emit('cancel');
};

const openAccountMenu = (ev: MouseEvent): void => {
	openAccountMenu_({
		withExtraOperation: false,
		includeCurrentAccount: true,
		active: postAccount?.id ?? $i?.id,
		onChoose: (account) => {
			updatePostAccount(account);
		},
	}, ev);
};

const chooseDraft = (): void => {
	os.popup(defineAsyncComponent(() => import('@/components/TmsDraftsList.vue')), {
		active: draftKey,
	}, {
		chosen: (draft_: Draft.Draft) => {
			emit('reopen', draft_);
		},
	}, 'closed');
};

const toggleLocalOnly = (): void => {
	if (channel) {
		visibility = 'public';
		localOnly = true;
		return;
	}

	localOnly = !localOnly;
};

const openVisibilityPicker = (): void => {
	if (channel) {
		visibility = 'public';
		localOnly = true;
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

const togglePreview = (): void => {
	showPreview = !showPreview;
};

const post = async (ev?: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev);
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	}

	let postData = {
		text: text || undefined,
		fileIds: files.length !== 0 ? files.map(({ id }) => id) : undefined,
		replyId: reply?.id || undefined,
		renoteId: renote?.id || quote?.id || undefined,
		channelId: channel?.id || undefined,
		poll: poll,
		cw: useCw ? cw : undefined,
		localOnly: localOnly,
		visibility: visibility,
		visibleUserIds: visibility === 'specified' ? visibleUsers.map(({ id }) => id) : undefined,
	};

	if (withHashtags) {
		const hashtags_ = hashtags.split(/[\s#]/).flatMap(x => x ? [`#${x}`] : []).join(' ');
		postData.text = `${postData.text} ${hashtags_}`.trim();
	}

	if (notePostInterruptors.length !== 0) {
		for (const interruptor of notePostInterruptors) {
			postData = (await interruptor.handler(deepClone(postData))) as typeof postData;
		}
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
				const hashtags_ = mfm.parse(postData.text).flatMap((x) => x.type === 'hashtag' ? [x.props.hashtag] : []);
				const history = parseArray<string[]>(localStorage.getItem('hashtags'));
				localStorage.setItem('hashtags', JSON.stringify(unique(hashtags_.concat(history))));
			}

			posting = false;
			updatePostAccount(null);

			imanonashi(createdNote);
		});
	}).catch((err: unknown) => {
		const { id, message } = err as {
			id: string;
			message: string;
		};

		posting = false;

		os.alert({
			type: 'error',
			text: `${message}\n${id}`,
		});
	});
};
//#endregion

//#region footer buttons
const chooseFileFrom = (ev: MouseEvent): void => {
	const el = getHtmlElementFromEvent(ev);

	selectFiles(el, i18n.ts.attachFile, fetchingWrapper)
		.then(_files => {
			for (const file of _files) {
				files.push(file);
			}
		});
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

const toggleUseCw = (): void => {
	useCw = !useCw;
};

const insertMention = (): void => {
	fetchingWrapper(
		os.selectUser().then(user => {
			insertTextAtCursor(textareaEl, `@${Acct.toString(user)} `);
		}),
	);
};

const toggleWithHashtags = (): void => {
	withHashtags = !withHashtags;
	defaultStore.set('postFormWithHashtags', withHashtags);
};

const showActions = (ev: MouseEvent): void => {
	const el = getHtmlElementFromEvent(ev);
	if (!el) return;

	os.popupMenu(postFormActions.map(action => {
		return {
			text: action.title,
			action: (): void => {
				action.handler({ text }, (key, value) => {
					if (key === 'text') text = value;
				});
			},
		};
	}), el);
};

const insertEmoji = async (ev: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev);
	if (!el) return;

	os.openEmojiPicker(el, {}, textareaEl);
};
//#endregion
</script>

<style lang="scss" module>
.root {
	position: relative;

	&.modal {
		width: 100%;
		max-width: 520px;
	}
}

.header {
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: auto 1fr;
	grid-template-rows: 1fr;
	gap: 4px;
	min-height: 50px;
}

.headerLeft {
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: max-content;
	grid-template-columns: minmax(36px, 50px);
	grid-template-rows: minmax(40px, 100%);
	gap: 4px;
}

.cancel {
	padding: 0;
	font-size: 1em;
	height: 100%;
}

.account {
	height: 100%;
	vertical-align: bottom;

	> .avatar {
		width: 28px;
		height: 28px;
		margin: auto 0;
	}
}

.headerRight {
	justify-self: end;
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: max-content;
	align-items: center;
	gap: 4px;
	font-size: 0.9em;
}

.headerRightItem {
	margin: 0;
	padding: 8px;
	border-radius: 6px;

	&:disabled {
		background: none;
	}
}

.headerRightButton {
	display: flex;
	gap: 6px;
	margin: 0;
	padding: 8px;
	border-radius: 6px;
	overflow: hidden;
	white-space: nowrap;

	&:not(:disabled):hover,
	&:not(:disabled):active {
		background: var(--X5);
	}

	&.headerRightButtonActive {
		color: var(--accent);
	}

	> .headerRightButtonText {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&:enabled > .headerRightButtonText {
		opacity: 0.8;
	}
}

.submit {
	margin: 12px 12px 12px 6px;
	vertical-align: bottom;

	&:disabled {
		opacity: 0.7;
	}

	&.submitPosting {
		cursor: wait;
	}

	&:not(:disabled):hover,
	&:not(:disabled):active {
		> .submitInner {
			background: linear-gradient(90deg, var(--X8), var(--X8));
		}
	}

	> .submitInner {
		padding: 0 12px;
		line-height: 34px;
		font-weight: bold;
		border-radius: 6px;
		min-width: 90px;
		box-sizing: border-box;
		color: var(--fgOnAccent);
		background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));
	}
}

.replyNote {
	padding: 0 20px 16px 20px;
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

.infoList {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 0 20px 16px 20px;

	&:empty {
		display: none;
	}
}

.forms {
	--tmsPostForm-inputPadding: 24px;
}

.input {
	display: block;
	box-sizing: border-box;
	padding: 0 var(--tmsPostForm-inputPadding);
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
	padding-bottom: 8px;
	border-bottom: solid 0.5px var(--divider);
}

.hashtags {
	padding-top: 8px;
	padding-bottom: 8px;
	border-top: solid 0.5px var(--divider);
}

.textOuter {
	width: 100%;
	position: relative;
}

.text {
	max-width: 100%;
	min-width: 100%;
	width: 100%;
	min-height: 90px;
	height: 100%;
	padding-right: max(var(--tmsPostForm-inputPadding), var(--tmsPostForm-counterWidth, 0px));

	&.withCw {
		padding-top: 8px;
	}
}

.quote {
	padding: 8px var(--tmsPostForm-inputPadding);

	> .quoteInner {
		position: relative;
		padding: 16px;
		border: dashed 1px var(--renote);
		border-radius: 8px;

		&.hasQuoteCancel {
			padding-right: 32px;
		}

		> .quoteCancel {
			position: absolute;
			top: 0;
			right: 0;
			padding: 4px;
			font-size: 16px;
		}
	}
}

.textCount {
	position: absolute;
	top: 0;
	right: 0;
	padding: 4px 8px;
	font-size: 0.9em;
	color: var(--fg);
	min-width: 1.6em;
	pointer-events: none;
	opacity: 0.8;

	&.textOver {
		color: var(--error);
	}
}

.preview {
	padding: 16px 20px 0 20px;
}

.footer {
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
	padding: 0 16px 16px 16px;
	font-size: 1em;
}

.footerButton {
	aspect-ratio: 1 / 1;
	border-radius: 6px;

	&:not(:disabled):hover,
	&:not(:disabled):active {
		background: var(--X5);
	}

	&.footerButtonActive {
		color: var(--accent);
	}
}

:global(.max-width_500px) {
	.headerRightButtonText {
		display: none;
	}

	.submit {
		margin: 8px 8px 8px 4px;
	}

	.replyNote {
		padding: 0 14px 16px 14px;
	}

	.toSpecified {
		padding: 6px 16px;
	}

	.infoList {
		padding: 0 14px 16px 14px;
	}

	.forms {
		--tmsPostForm-inputPadding: 16px;
	}

	.text {
		min-height: 80px;
	}

	.preview {
		padding: 16px 14px 0 14px;
	}

	.footer {
		padding: 0 8px 8px 8px;
	}
}

:global(.max-width_310px) {
	.header {
		gap: 0;
	}

	.headerLeft {
		gap: 0;
	}

	.headerRight {
		gap: 0;
	}

	.footer {
		font-size: 14px;
	}
}
</style>
