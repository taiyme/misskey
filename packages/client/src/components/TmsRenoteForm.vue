<template>
<div
	ref="rootEl"
	v-size="{ max: [310, 500] }"
	:class="[$style.root, { [$style.modal]: modal, _popup: modal }]"
>
	<header :class="$style.header">
		<div :class="$style.headerLeft">
			<button :class="['_button', $style.cancel]" @click="cancel">
				<i class="ti ti-x"></i>
			</button>
			<button v-tooltip="i18n.ts.switchAccount" :class="['_button', $style.account]" @click="openAccountMenu">
				<MkAvatar :user="postAccount ?? ($i as any)" :class="$style.avatar"/>
			</button>
		</div>
		<div :class="$style.headerRight">
			<template v-if="!channel">
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
			<button :class="['_button', $style.submit, { [$style.submitPosting]: posting }]" :disabled="!canPost" data-cy-open-post-form-submit @click="post">
				<div :class="$style.submitInner">
					<template v-if="posted"></template>
					<template v-else-if="posting"><MkEllipsis/></template>
					<template v-else>{{ i18n.ts.quote }}</template>
					<i :style="{ marginLeft: !posted ? '6px' : undefined }" class="ti" :class="posted ? 'ti-check' : 'ti-send'"></i>
				</div>
			</button>
		</div>
	</header>
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
	<div :class="$style.forms">
		<div :class="$style.textOuter">
			<div :class="$style.quote">
				<div :class="$style.quoteInner">
					<MkNoteSimple :note="renote"/>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { nextTick, inject, defineAsyncComponent } from 'vue';
import * as Misskey from 'misskey-js';
import { v4 as uuid } from 'uuid';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { $i, getAccounts, openAccountMenu as openAccountMenu_ } from '@/account';
import { erase } from '@/scripts/array';
import { migrateNoteVisibility as _migrateNoteVisibility } from '@/scripts/tms/note-visibility';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';

//#region define
const props = defineProps<{
	renote: Misskey.entities.Note;
}>();

const emit = defineEmits<{
	(ev: 'posted'): void;
	(ev: 'cancel'): void;
	(ev: 'esc'): void;
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
let visibility = $ref<Misskey.entities.Note['visibility']>(defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility);
let localOnly = $ref<boolean>(defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly);

let visibleUsers = $ref<Misskey.entities.User[]>([]);
const renote = $ref<Misskey.entities.Note>(props.renote);
const channel = $ref<Misskey.entities.Channel | null>((renote as typeof renote & { channel?: Misskey.entities.Channel })?.channel ?? null);

let posting = $ref(false);
let posted = $ref(false);

const canPost = $computed((): boolean => {
	return !fetching && !posting && !posted && !!renote;
});

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
		}),
	);
};

const removeVisibleUser = (user: Misskey.entities.User): void => {
	visibleUsers = erase(user, visibleUsers);
};
//#endregion

//#region init
// 公開範囲の引き継ぎ
let disabledVisibilities = $ref([] as Misskey.entities.Note['visibility'][]);
const migrateNoteVisibility = (): void => {
	if (channel) {
		visibility = 'public';
		localOnly = true;
		return;
	}

	const parseNoteVis = (_note: Misskey.entities.Note | null): {
		visibility: typeof Misskey.noteVisibilities[number];
		localOnly: boolean;
		visibleUserIds: string[];
	} | null => _note ? {
		visibility: _note.visibility,
		localOnly: !!_note.localOnly,
		visibleUserIds: _note.visibleUserIds ?? [],
	} : null;

	const migrated = _migrateNoteVisibility({
		note: {
			visibility,
			localOnly,
			visibleUserIds: visibleUsers.map(({ id }) => id),
		},
		renote: parseNoteVis(renote),
	});

	visibility = migrated.visibility;
	localOnly = migrated.localOnly;
	disabledVisibilities = migrated.disabledVisibilities;

	if (visibility !== 'specified') {
		visibleUsers = [];
	}

	if (migrated.visibleUserIds.length !== 0) {
		const visibleUserIds = migrated.visibleUserIds.filter(id => id !== $i?.id && !visibleUsers.some(x => id === x.id));
		fetchingWrapper(
			os.api('users/show', { userIds: visibleUserIds }, token)
				.then(users => {
					users.forEach(user => {
						pushVisibleUser(user);
					});
				}),
		);
	} else {
		visibleUsers = [];
	}
};

migrateNoteVisibility();
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
		disabledVisibilities,
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

const post = async (ev?: MouseEvent): Promise<void> => {
	const el = getHtmlElementFromEvent(ev);
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	}

	let postData = {
		renoteId: renote.id,
		channelId: channel?.id || undefined,
		localOnly: localOnly,
		visibility: visibility,
		visibleUserIds: visibility === 'specified' ? visibleUsers.map(({ id }) => id) : undefined,
	};

	posting = true;
	os.api('notes/create', postData, token).then(() => {
		posted = true;

		nextTick(() => {
			emit('posted');

			posting = false;
			updatePostAccount(null);
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

.forms {
	--tmsPostForm-inputPadding: 24px;
}

.textOuter {
	width: 100%;
	position: relative;
}

.quote {
	padding: 8px var(--tmsPostForm-inputPadding);

	> .quoteInner {
		position: relative;
		padding: 16px;
		border: dashed 1px var(--renote);
		border-radius: 8px;
	}
}

:global(.max-width_500px) {
	.headerRightButtonText {
		display: none;
	}

	.submit {
		margin: 8px 8px 8px 4px;
	}

	.toSpecified {
		padding: 6px 16px;
	}

	.forms {
		--tmsPostForm-inputPadding: 16px;
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
}
</style>
