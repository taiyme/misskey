/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent, Ref, ShallowRef } from 'vue';
import * as Misskey from 'misskey-js';
import { claimAchievement } from './achievements.js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { copyText } from '@/scripts/tms/clipboard.js';
import { url } from '@/config.js';
import { defaultStore, noteActions } from '@/store.js';
import { miLocalStorage } from '@/local-storage.js';
import { getUserMenu } from '@/scripts/get-user-menu.js';
import { clipsCache, favoritedChannelsCache } from '@/cache.js';
import { MenuItem } from '@/types/menu.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { isSupportShare } from '@/scripts/navigator.js';
import { parseErrorMessage } from '@/scripts/tms/error.js';
import { getAppearNote } from '@/scripts/tms/get-appear-note.js';
import { numberquote } from '@/scripts/tms/numberquote.js';
import { pakuru } from '@/scripts/tms/pakuru.js';
import { tooltipFromElement } from '@/scripts/tms/tooltip-from-element.js';
import { smallerVisibility } from '@/scripts/tms/visibility.js';
import { tmsStore } from '@/tms/store.js';

export async function getNoteClipMenu(props: {
	note: Misskey.entities.Note;
	isDeleted: Ref<boolean>;
	currentClip?: Misskey.entities.Clip;
}) {
	function getClipName(clip: Misskey.entities.Clip) {
		if ($i && clip.userId === $i.id && clip.notesCount != null) {
			return `${clip.name} (${clip.notesCount}/${$i.policies.noteEachClipsLimit})`;
		} else {
			return clip.name;
		}
	}

	const appearNote = getAppearNote(props.note);

	const clips = await clipsCache.fetch();
	const menu: MenuItem[] = [...clips.map(clip => ({
		text: getClipName(clip),
		action: () => {
			claimAchievement('noteClipped1');
			os.promiseDialog(
				misskeyApi('clips/add-note', { clipId: clip.id, noteId: appearNote.id }),
				null,
				async (err) => {
					if (err.id === '734806c4-542c-463a-9311-15c512803965') {
						const confirm = await os.confirm({
							type: 'warning',
							text: i18n.tsx.confirmToUnclipAlreadyClippedNote({ name: clip.name }),
						});
						if (!confirm.canceled) {
							os.apiWithDialog('clips/remove-note', { clipId: clip.id, noteId: appearNote.id }).then(() => {
								clipsCache.set(clips.map(c => {
									if (c.id === clip.id) {
										return {
											...c,
											notesCount: Math.max(0, ((c.notesCount ?? 0) - 1)),
										};
									} else {
										return c;
									}
								}));
							});
							if (props.currentClip?.id === clip.id) props.isDeleted.value = true;
						}
					} else {
						os.alert({
							type: 'error',
							text: err.message + '\n' + err.id,
						});
					}
				},
			).then(() => {
				clipsCache.set(clips.map(c => {
					if (c.id === clip.id) {
						return {
							...c,
							notesCount: (c.notesCount ?? 0) + 1,
						};
					} else {
						return c;
					}
				}));
			});
		},
	})), { type: 'divider' }, {
		icon: 'ti ti-plus',
		text: i18n.ts.createNew,
		action: async () => {
			const { canceled, result } = await os.form(i18n.ts.createNewClip, {
				name: {
					type: 'string',
					label: i18n.ts.name,
				},
				description: {
					type: 'string',
					required: false,
					multiline: true,
					label: i18n.ts.description,
				},
				isPublic: {
					type: 'boolean',
					label: i18n.ts.public,
					default: false,
				},
			});
			if (canceled) return;

			const clip = await os.apiWithDialog('clips/create', result);

			clipsCache.delete();

			claimAchievement('noteClipped1');
			os.apiWithDialog('clips/add-note', { clipId: clip.id, noteId: appearNote.id });
		},
	}];

	return menu;
}

export function getAbuseNoteMenu(note: Misskey.entities.Note, text: string): MenuItem {
	return {
		icon: 'ti ti-exclamation-circle',
		text,
		action: (): void => {
			const localUrl = `${url}/notes/${note.id}`;
			let noteInfo = '';
			if (note.url ?? note.uri != null) noteInfo = `Note: ${note.url ?? note.uri}\n`;
			noteInfo += `Local Note: ${localUrl}\n`;
			os.popup(defineAsyncComponent(() => import('@/components/MkAbuseReportWindow.vue')), {
				user: note.user,
				initialComment: `${noteInfo}-----\n`,
			}, {}, 'closed');
		},
	};
}

export function getCopyNoteLinkMenu(note: Misskey.entities.Note, text: string): MenuItem {
	return {
		icon: 'ti ti-link',
		text,
		action: (): void => {
			copyText(`${url}/notes/${note.id}`);
			os.success();
		},
	};
}

export function getNoteMenu(props: {
	note: Misskey.entities.Note;
	translation: Ref<Misskey.entities.NotesTranslateResponse | null>;
	translating: Ref<boolean>;
	isDeleted: Ref<boolean>;
	currentClip?: Misskey.entities.Clip;
}) {
	const appearNote = getAppearNote(props.note);

	const cleanups = [] as (() => void)[];

	function del(): void {
		os.confirm({
			type: 'warning',
			text: i18n.ts.noteDeleteConfirm,
			note: appearNote,
		}).then(({ canceled }) => {
			if (canceled) return;

			misskeyApi('notes/delete', {
				noteId: appearNote.id,
			});

			if (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 60) {
				claimAchievement('noteDeletedWithin1min');
			}
		});
	}

	function delEdit(): void {
		os.confirm({
			type: 'warning',
			text: i18n.ts.deleteAndEditConfirm,
			note: appearNote,
		}).then(({ canceled }) => {
			if (canceled) return;

			misskeyApi('notes/delete', {
				noteId: appearNote.id,
			});

			os.post({ initialNote: appearNote, renote: appearNote.renote, reply: appearNote.reply, channel: appearNote.channel });

			if (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 60) {
				claimAchievement('noteDeletedWithin1min');
			}
		});
	}

	function toggleFavorite(favorite: boolean): void {
		claimAchievement('noteFavorited1');
		os.apiWithDialog(favorite ? 'notes/favorites/create' : 'notes/favorites/delete', {
			noteId: appearNote.id,
		});
	}

	function toggleThreadMute(mute: boolean): void {
		os.apiWithDialog(mute ? 'notes/thread-muting/create' : 'notes/thread-muting/delete', {
			noteId: appearNote.id,
		});
	}

	function copyContent(): void {
		copyText(appearNote.text);
		os.success();
	}

	function copyLink(): void {
		copyText(`${url}/notes/${appearNote.id}`);
		os.success();
	}

	function togglePin(pin: boolean): void {
		os.apiWithDialog(pin ? 'i/pin' : 'i/unpin', {
			noteId: appearNote.id,
		}, undefined, null, res => {
			if (res.id === '72dab508-c64d-498f-8740-a8eec1ba385a') {
				os.alert({
					type: 'error',
					text: i18n.ts.pinLimitExceeded,
				});
			}
		});
	}

	async function unclip(): Promise<void> {
		os.apiWithDialog('clips/remove-note', { clipId: props.currentClip.id, noteId: appearNote.id });
		props.isDeleted.value = true;
	}

	async function promote(): Promise<void> {
		const { canceled, result: days } = await os.inputNumber({
			title: i18n.ts.numberOfDays,
		});

		if (canceled) return;

		os.apiWithDialog('admin/promo/create', {
			noteId: appearNote.id,
			expiresAt: Date.now() + (86400000 * days),
		});
	}

	function share(): void {
		navigator.share({
			title: i18n.tsx.noteOf({ user: appearNote.user.name }),
			text: appearNote.text,
			url: `${url}/notes/${appearNote.id}`,
		});
	}

	function openDetail(): void {
		os.pageWindow(`/notes/${appearNote.id}`);
	}

	async function translate(): Promise<void> {
		if (props.translation.value != null) return;
		props.translating.value = true;
		const res = await misskeyApi('notes/translate', {
			noteId: appearNote.id,
			targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
		});
		props.translating.value = false;
		props.translation.value = res;
	}

	let menu: MenuItem[];
	if ($i) {
		const statePromise = misskeyApi('notes/state', {
			noteId: appearNote.id,
		});

		menu = [
			...(
				props.currentClip?.userId === $i.id ? [{
					icon: 'ti ti-backspace',
					text: i18n.ts.unclip,
					danger: true,
					action: unclip,
				}, { type: 'divider' }] : []
			), {
				icon: 'ti ti-info-circle',
				text: i18n.ts.details,
				action: openDetail,
			}, {
				icon: 'ti ti-copy',
				text: i18n.ts.copyContent,
				action: copyContent,
			}, getCopyNoteLinkMenu(appearNote, i18n.ts.copyLink)
			, (appearNote.url || appearNote.uri) ? {
				icon: 'ti ti-external-link',
				text: i18n.ts.showOnRemote,
				action: () => {
					window.open(appearNote.url ?? appearNote.uri, '_blank', 'noopener');
				},
			} : undefined,
			...(isSupportShare() ? [{
				icon: 'ti ti-share',
				text: i18n.ts.share,
				action: share,
			}] : []),
			$i && $i.policies.canUseTranslator && instance.translatorAvailable ? {
				icon: 'ti ti-language-hiragana',
				text: i18n.ts.translate,
				action: translate,
			} : undefined,
			{ type: 'divider' },
			statePromise.then(state => state.isFavorited ? {
				icon: 'ti ti-star-off',
				text: i18n.ts.unfavorite,
				action: () => toggleFavorite(false),
			} : {
				icon: 'ti ti-star',
				text: i18n.ts.favorite,
				action: () => toggleFavorite(true),
			}),
			{
				type: 'parent' as const,
				icon: 'ti ti-paperclip',
				text: i18n.ts.clip,
				children: () => getNoteClipMenu(props),
			},
			statePromise.then(state => state.isMutedThread ? {
				icon: 'ti ti-message-off',
				text: i18n.ts.unmuteThread,
				action: () => toggleThreadMute(false),
			} : {
				icon: 'ti ti-message-off',
				text: i18n.ts.muteThread,
				action: () => toggleThreadMute(true),
			}),
			appearNote.userId === $i.id ? ($i.pinnedNoteIds ?? []).includes(appearNote.id) ? {
				icon: 'ti ti-pinned-off',
				text: i18n.ts.unpin,
				action: () => togglePin(false),
			} : {
				icon: 'ti ti-pin',
				text: i18n.ts.pin,
				action: () => togglePin(true),
			} : undefined,
			{
				type: 'parent' as const,
				icon: 'ti ti-user',
				text: i18n.ts.user,
				children: async () => {
					const user = appearNote.userId === $i?.id ? $i : await misskeyApi('users/show', { userId: appearNote.userId });
					const { menu, cleanup } = getUserMenu(user);
					cleanups.push(cleanup);
					return menu;
				},
			},
			/*
		...($i.isModerator || $i.isAdmin ? [
			{ type: 'divider' },
			{
				icon: 'ti ti-speakerphone',
				text: i18n.ts.promote,
				action: promote
			}]
			: []
		),*/
			...(appearNote.userId !== $i.id ? [
				{ type: 'divider' },
				appearNote.userId !== $i.id ? getAbuseNoteMenu(appearNote, i18n.ts.reportAbuse) : undefined,
			]
			: []
			),
			...(appearNote.channel && (appearNote.channel.userId === $i.id || $i.isModerator || $i.isAdmin) ? [
				{ type: 'divider' },
				{
					type: 'parent' as const,
					icon: 'ti ti-device-tv',
					text: i18n.ts.channel,
					children: async () => {
						const channelChildMenu = [] as MenuItem[];

						const channel = await misskeyApi('channels/show', { channelId: appearNote.channel!.id });

						if (channel.pinnedNoteIds.includes(appearNote.id)) {
							channelChildMenu.push({
								icon: 'ti ti-pinned-off',
								text: i18n.ts.unpin,
								action: () => os.apiWithDialog('channels/update', {
									channelId: appearNote.channel!.id,
									pinnedNoteIds: channel.pinnedNoteIds.filter(id => id !== appearNote.id),
								}),
							});
						} else {
							channelChildMenu.push({
								icon: 'ti ti-pin',
								text: i18n.ts.pin,
								action: () => os.apiWithDialog('channels/update', {
									channelId: appearNote.channel!.id,
									pinnedNoteIds: [...channel.pinnedNoteIds, appearNote.id],
								}),
							});
						}
						return channelChildMenu;
					},
				},
			]
			: []
			),
			...(appearNote.userId === $i.id || $i.isModerator || $i.isAdmin ? [
				{ type: 'divider' },
				appearNote.userId === $i.id ? {
					icon: 'ti ti-edit',
					text: i18n.ts.deleteAndEdit,
					action: delEdit,
				} : undefined,
				{
					icon: 'ti ti-trash',
					text: i18n.ts.delete,
					danger: true,
					action: del,
				}]
			: []
			)]
			.filter(x => x !== undefined);
	} else {
		menu = [{
			icon: 'ti ti-info-circle',
			text: i18n.ts.details,
			action: openDetail,
		}, {
			icon: 'ti ti-copy',
			text: i18n.ts.copyContent,
			action: copyContent,
		}, getCopyNoteLinkMenu(appearNote, i18n.ts.copyLink)
		, (appearNote.url || appearNote.uri) ? {
			icon: 'ti ti-external-link',
			text: i18n.ts.showOnRemote,
			action: () => {
				window.open(appearNote.url ?? appearNote.uri, '_blank', 'noopener');
			},
		} : undefined]
			.filter(x => x !== undefined);
	}

	if (noteActions.length > 0) {
		menu = menu.concat([{ type: 'divider' }, ...noteActions.map(action => ({
			icon: 'ti ti-plug',
			text: action.title,
			action: () => {
				action.handler(appearNote);
			},
		}))]);
	}

	if (defaultStore.state.devMode) {
		menu = menu.concat([{ type: 'divider' }, {
			icon: 'ti ti-id',
			text: i18n.ts.copyNoteId,
			action: () => {
				copyText(appearNote.id);
			},
		}]);
	}

	const cleanup = () => {
		if (_DEV_) console.log('note menu cleanup', cleanups);
		for (const cl of cleanups) {
			cl();
		}
	};

	return {
		menu,
		cleanup,
	};
}

export async function getRenoteMenu(props: {
	note: Misskey.entities.Note;
	renoteButton: ShallowRef<HTMLElement | undefined>;
	mock?: boolean;
	canRenote?: boolean;
}) {
	const appearNote = getAppearNote(props.note);
	const canRenote = props.canRenote ?? true;
	const favoritedChannels = (await favoritedChannelsCache.fetch()).filter(channel => {
		return appearNote.channel == null || channel.id !== appearNote.channel.id;
	});

	const rippleEffect = (): void => {
		const el = props.renoteButton.value;
		if (el == null) return;
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	};

	const tooltipEffect = (text: string): void => {
		tooltipFromElement({
			targetElement: props.renoteButton.value,
			primary: true,
			text,
		});
	};

	const errorDialog = (err: unknown): void => {
		os.alert({
			type: 'error',
			text: parseErrorMessage(err),
		});
	};

	const channelRenoteItems: MenuItem[] = [];
	const normalRenoteItems: MenuItem[] = [];
	const normalExternalChannelRenoteItems: MenuItem[] = [];
	const pakuruItems: MenuItem[] = [];

	if (canRenote && appearNote.channel != null) {
		channelRenoteItems.push({
			text: i18n.ts.inChannelRenote,
			icon: 'ti ti-repeat',
			action: () => {
				rippleEffect();
				if (props.mock) return tooltipEffect(i18n.ts.renoted);
				misskeyApi('notes/create', {
					renoteId: appearNote.id,
					channelId: appearNote.channelId,
				}).then(() => tooltipEffect(i18n.ts.renoted)).catch(errorDialog);
			},
		});
		if (!props.mock) {
			channelRenoteItems.push({
				text: i18n.ts.inChannelQuote,
				icon: 'ti ti-quote',
				action: () => {
					os.post({
						renote: appearNote,
						channel: appearNote.channel,
					});
				},
			});
		}
	}

	if (canRenote && (appearNote.channel == null || appearNote.channel.allowRenoteToExternal)) {
		let renoteVisibility = appearNote.visibility;
		const renoteLocalOnly = appearNote.localOnly ?? false;

		if (appearNote.channel?.isSensitive || $i?.isSilenced) {
			renoteVisibility = smallerVisibility([renoteVisibility, 'home']);
		}

		const renoteButtonText = (() => {
			if (renoteVisibility === 'home') {
				if (renoteLocalOnly) return i18n.ts._tms.disableFederationHomeRenote;
				return i18n.ts._tms.homeRenote;
			}
			if (renoteVisibility === 'followers') {
				if (renoteLocalOnly) return i18n.ts._tms.disableFederationFollowersRenote;
				return i18n.ts._tms.followersRenote;
			}
			if (renoteLocalOnly) return i18n.ts._tms.disableFederationRenote;
			return i18n.ts.renote;
		})();

		normalRenoteItems.push({
			text: renoteButtonText,
			icon: 'ti ti-repeat',
			action: () => {
				rippleEffect();
				if (props.mock) return tooltipEffect(i18n.ts.renoted);
				misskeyApi('notes/create', {
					renoteId: appearNote.id,
					visibility: renoteVisibility,
					localOnly: renoteLocalOnly,
				}).then(() => tooltipEffect(i18n.ts.renoted)).catch(errorDialog);
			},
		});
		if (!props.mock) {
			normalRenoteItems.push({
				text: i18n.ts.quote,
				icon: 'ti ti-quote',
				action: () => {
					os.post({
						renote: appearNote,
					});
				},
			});
		}

		if (!props.mock && favoritedChannels.length > 0) {
			normalExternalChannelRenoteItems.push({
				type: 'parent',
				text: appearNote.channel == null ? i18n.ts.renoteToChannel : i18n.ts.renoteToOtherChannel,
				icon: 'ti ti-repeat',
				children: favoritedChannels.map(channel => ({
					text: channel.name,
					action: () => {
						rippleEffect();
						misskeyApi('notes/create', {
							renoteId: appearNote.id,
							channelId: channel.id,
						}).then(() => tooltipEffect(i18n.tsx.renotedToX({ name: channel.name }))).catch(errorDialog);
					},
				})),
			});
		}
	}

	if (tmsStore.state.enablePakuru) {
		pakuruItems.push({
			text: i18n.ts._tms.pakuru,
			icon: 'ti ti-swipe',
			action: () => {
				if (props.mock) return tooltipEffect(i18n.ts._tms.didPakuru);
				pakuru(appearNote).then(() => tooltipEffect(i18n.ts._tms.didPakuru)).catch(errorDialog);
			},
		});
	}

	if (tmsStore.state.enableNumberquote) {
		pakuruItems.push({
			text: i18n.ts._tms.numberquote,
			icon: 'ti ti-exposure-plus-1',
			action: () => {
				if (props.mock) return tooltipEffect(i18n.ts._tms.didNumberquote);
				numberquote(appearNote).then(() => tooltipEffect(i18n.ts._tms.didNumberquote)).catch(errorDialog);
			},
		});
	}

	const renoteItems: MenuItem[] = [];
	if (normalRenoteItems.length > 0) {
		renoteItems.push(...normalRenoteItems);
	}
	if (channelRenoteItems.length > 0) {
		if (renoteItems.length > 0) renoteItems.push({ type: 'divider' });
		renoteItems.push(...channelRenoteItems);
	}
	if (normalExternalChannelRenoteItems.length > 0) {
		if (renoteItems.length > 0) renoteItems.push({ type: 'divider' });
		renoteItems.push(...normalExternalChannelRenoteItems);
	}
	if (pakuruItems.length > 0) {
		if (renoteItems.length > 0) renoteItems.push({ type: 'divider' });
		renoteItems.push(...pakuruItems);
	}

	return {
		menu: renoteItems,
	};
}
