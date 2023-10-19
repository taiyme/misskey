import type {
	Ad, Announcement, Antenna, App, AuthSession, Blocking, Channel, Clip, DateString, DetailedInstanceMetadata, DriveFile, DriveFolder, Following, FollowingFolloweePopulated, FollowingFollowerPopulated, FollowRequest, GalleryPost, Instance,
	LiteInstanceMetadata,
	MeDetailed,
	Note, NoteFavorite, OriginType, Page, ServerInfo, Stats, User, UserDetailed, MeSignup, UserGroup, UserList, UserSorting, Notification, NoteReaction, Signin, MessagingMessage, Invite, InviteLimit, AdminInstanceMetadata,
} from './entities.js';

type ReqTODO = Record<string, any>;
type ResTODO = unknown;
type NoParams = Record<string, never>;

export type Endpoints = {
	// admin
	'admin/abuse-user-reports': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/delete-all-files-of-a-user': {
		req: {
			userId: User['id'];
		};
		res: null;
	};
	'admin/delete-logs': {
		req: NoParams;
		res: null;
	};
	'admin/get-index-stats': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/get-table-stats': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/invite': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/logs': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/meta': {
		req: NoParams;
		res: AdminInstanceMetadata;
	};
	'admin/reset-password': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/resolve-abuse-user-report': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/resync-chart': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/send-email': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/server-info': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/show-moderation-logs': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/show-user': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/show-users': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/silence-user': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/suspend-user': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/unsilence-user': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/unsuspend-user': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/update-meta': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/vacuum': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/accounts/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/ad/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/ad/delete': {
		req: {
			id: Ad['id'];
		};
		res: null;
	};
	'admin/ad/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/ad/update': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/announcements/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/announcements/delete': {
		req: {
			id: Announcement['id'];
		};
		res: null;
	};
	'admin/announcements/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/announcements/update': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/drive/clean-remote-files': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/drive/cleanup': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/drive/files': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/drive/show-file': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/add': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/copy': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/list-remote': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/remove': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/emoji/update': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/federation/delete-all-files': {
		req: {
			host: string;
		};
		res: null;
	};
	'admin/federation/refresh-remote-instance-metadata': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/federation/remove-all-following': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/federation/update-instance': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/invite/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/invite/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/moderators/add': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/moderators/remove': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/promo/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/queue/clear': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/queue/deliver-delayed': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/queue/inbox-delayed': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/queue/jobs': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/queue/stats': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/relays/add': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/relays/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'admin/relays/remove': {
		req: ReqTODO;
		res: ResTODO;
	};

	// announcements
	'announcements': {
		req: {
			limit?: number;
			withUnreads?: boolean;
			sinceId?: Announcement['id'];
			untilId?: Announcement['id'];
		};
		res: Announcement[];
	};

	// antennas
	'antennas/create': {
		req: ReqTODO;
		res: Antenna;
	};
	'antennas/delete': {
		req: {
			antennaId: Antenna['id'];
		};
		res: null;
	};
	'antennas/list': {
		req: NoParams;
		res: Antenna[];
	};
	'antennas/notes': {
		req: {
			antennaId: Antenna['id'];
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
		};
		res: Note[];
	};
	'antennas/show': {
		req: {
			antennaId: Antenna['id'];
		};
		res: Antenna;
	};
	'antennas/update': {
		req: ReqTODO;
		res: Antenna;
	};

	// ap
	'ap/get': {
		req: {
			uri: string;
		};
		res: Record<string, any>;
	};
	'ap/show': {
		req: {
			uri: string;
		};
		res: {
			type: 'Note';
			object: Note;
		} | {
			type: 'User';
			object: UserDetailed;
		};
	};

	// app
	'app/create': {
		req: ReqTODO;
		res: App;
	};
	'app/show': {
		req: {
			appId: App['id'];
		};
		res: App;
	};

	// auth
	'auth/accept': {
		req: {
			token: string;
		};
		res: null;
	};
	'auth/session/generate': {
		req: {
			appSecret: string;
		};
		res: {
			token: string;
			url: string;
		};
	};
	'auth/session/show': {
		req: {
			token: string;
		};
		res: AuthSession;
	};
	'auth/session/userkey': {
		req: {
			appSecret: string;
			token: string;
		};
		res: {
			accessToken: string;
			user: User;
		};
	};

	// blocking
	'blocking/create': {
		req: {
			userId: User['id'];
		};
		res: UserDetailed;
	};
	'blocking/delete': {
		req: {
			userId: User['id'];
		};
		res: UserDetailed;
	};
	'blocking/list': {
		req: {
			limit?: number;
			sinceId?: Blocking['id'];
			untilId?: Blocking['id'];
		};
		res: Blocking[];
	};

	// channels
	'channels/create': {
		req: {
			name: Channel['name'];
			description?: Channel['description'];
			bannerId?: DriveFile['id'] | null;
			color?: Channel['color'];
			isSensitive?: Channel['isSensitive'] | null;
		};
		res: Channel;
	};
	'channels/featured': {
		req: NoParams;
		res: Channel[];
	};
	'channels/favorite': {
		req: {
			channelId: Channel['id'];
		};
		res: null;
	};
	'channels/follow': {
		req: {
			channelId: Channel['id'];
		};
		res: null;
	};
	'channels/followed': {
		req: {
			sinceId?: Channel['id'];
			untilId?: Channel['id'];
			limit?: number;
		};
		res: Channel[];
	};
	'channels/my-favorites': {
		req: NoParams;
		res: Channel[];
	};
	'channels/owned': {
		req: {
			sinceId?: Channel['id'];
			untilId?: Channel['id'];
			limit?: number;
		};
		res: Channel[];
	};
	'channels/search': {
		req: {
			query: string;
			type?: 'nameAndDescription' | 'nameOnly';
			sinceId?: Channel['id'];
			untilId?: Channel['id'];
			limit?: number;
		};
		res: Channel[];
	};
	'channels/show': {
		req: {
			channelId: Channel['id'];
		};
		res: Channel;
	};
	'channels/timeline': {
		req: {
			channelId: Channel['id'];
			limit?: number;
			sinceId?: Channel['id'];
			untilId?: Channel['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'channels/unfavorite': {
		req: {
			channelId: Channel['id'];
		};
		res: null;
	};
	'channels/unfollow': {
		req: {
			channelId: Channel['id'];
		};
		res: null;
	};
	'channels/update': {
		req: {
			channelId: Channel['id'];
			name?: Channel['name'];
			description?: Channel['description'];
			bannerId?: DriveFile['id'] | null;
			isArchived?: Channel['isArchived'] | null;
			pinnedNoteIds?: Channel['pinnedNoteIds'];
			color?: Channel['color'];
			isSensitive?: Channel['isSensitive'] | null;
		};
		res: Channel;
	};

	// charts
	'charts/active-users': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: {
			local: {
				users: number[];
			};
			remote: {
				users: number[];
			};
		};
	};
	'charts/drive': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: {
			local: {
				decCount: number[];
				decSize: number[];
				incCount: number[];
				incSize: number[];
				totalCount: number[];
				totalSize: number[];
			};
			remote: {
				decCount: number[];
				decSize: number[];
				incCount: number[];
				incSize: number[];
				totalCount: number[];
				totalSize: number[];
			};
		};
	};
	'charts/federation': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: {
			instance: {
				dec: number[];
				inc: number[];
				total: number[];
			};
		};
	};
	'charts/hashtag': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: ResTODO;
	};
	'charts/instance': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
			host: string;
		};
		res: {
			drive: {
				decFiles: number[];
				decUsage: number[];
				incFiles: number[];
				incUsage: number[];
				totalFiles: number[];
				totalUsage: number[];
			};
			followers: {
				dec: number[];
				inc: number[];
				total: number[];
			};
			following: {
				dec: number[];
				inc: number[];
				total: number[];
			};
			notes: {
				dec: number[];
				inc: number[];
				total: number[];
				diffs: {
					normal: number[];
					renote: number[];
					reply: number[];
				};
			};
			requests: {
				failed: number[];
				received: number[];
				succeeded: number[];
			};
			users: {
				dec: number[];
				inc: number[];
				total: number[];
			};
		};
	};
	'charts/network': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: ResTODO;
	};
	'charts/notes': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: {
			local: {
				dec: number[];
				inc: number[];
				total: number[];
				diffs: {
					normal: number[];
					renote: number[];
					reply: number[];
				};
			};
			remote: {
				dec: number[];
				inc: number[];
				total: number[];
				diffs: {
					normal: number[];
					renote: number[];
					reply: number[];
				};
			};
		};
	};
	'charts/user/drive': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
			userId: User['id'];
		};
		res: {
			decCount: number[];
			decSize: number[];
			incCount: number[];
			incSize: number[];
			totalCount: number[];
			totalSize: number[];
		};
	};
	'charts/user/following': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
			userId: User['id'];
		};
		res: ResTODO;
	};
	'charts/user/notes': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
			userId: User['id'];
		};
		res: {
			dec: number[];
			inc: number[];
			total: number[];
			diffs: {
				normal: number[];
				renote: number[];
				reply: number[];
			};
		};
	};
	'charts/user/reactions': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
			userId: User['id'];
		};
		res: ResTODO;
	};
	'charts/users': {
		req: {
			span: 'day' | 'hour';
			limit?: number;
			offset?: number | null;
		};
		res: {
			local: {
				dec: number[];
				inc: number[];
				total: number[];
			};
			remote: {
				dec: number[];
				inc: number[];
				total: number[];
			};
		};
	};

	// clips
	'clips/add-note': {
		req: ReqTODO;
		res: ResTODO;
	};
	'clips/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'clips/delete': {
		req: {
			clipId: Clip['id'];
		};
		res: null;
	};
	'clips/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'clips/notes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'clips/show': {
		req: ReqTODO;
		res: ResTODO;
	};
	'clips/update': {
		req: ReqTODO;
		res: ResTODO;
	};

	// drive
	'drive': {
		req: NoParams;
		res: {
			capacity: number;
			usage: number;
		};
	};
	'drive/files': {
		req: {
			folderId?: DriveFolder['id'] | null;
			type?: DriveFile['type'] | null;
			limit?: number;
			sinceId?: DriveFile['id'];
			untilId?: DriveFile['id'];
		};
		res: DriveFile[];
	};
	'drive/files/attached-notes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'drive/files/check-existence': {
		req: ReqTODO;
		res: ResTODO;
	};
	'drive/files/create': {
		req: {
			folderId?: string;
			name?: string;
			comment?: string;
			isSentisive?: boolean;
			force?: boolean;
		};
		res: DriveFile;
	};
	'drive/files/delete': {
		req: {
			fileId: DriveFile['id'];
		};
		res: null;
	};
	'drive/files/find-by-hash': {
		req: ReqTODO;
		res: ResTODO;
	};
	'drive/files/find': {
		req: {
			name: string;
			folderId?: DriveFolder['id'] | null;
		};
		res: DriveFile[];
	};
	'drive/files/show': {
		req: {
			fileId?: DriveFile['id'];
			url?: string;
		};
		res: DriveFile;
	};
	'drive/files/update': {
		req: {
			fileId: DriveFile['id'];
			folderId?: DriveFolder['id'] | null;
			name?: string;
			isSensitive?: boolean;
			comment?: string | null;
		};
		res: DriveFile;
	};
	'drive/files/upload-from-url': {
		req: {
			url: string;
			folderId?: DriveFolder['id'] | null;
			isSensitive?: boolean;
			comment?: string | null;
			marker?: string | null;
			force?: boolean;
		};
		res: null;
	};
	'drive/folders': {
		req: {
			folderId?: DriveFolder['id'] | null;
			limit?: number;
			sinceId?: DriveFile['id'];
			untilId?: DriveFile['id'];
		};
		res: DriveFolder[];
	};
	'drive/folders/create': {
		req: {
			name?: string;
			parentId?: DriveFolder['id'] | null;
		};
		res: DriveFolder;
	};
	'drive/folders/delete': {
		req: {
			folderId: DriveFolder['id'];
		};
		res: null;
	};
	'drive/folders/find': {
		req: {
			name: string;
			parentId?: DriveFolder['id'] | null;
		};
		res: DriveFolder[];
	};
	'drive/folders/show': {
		req: {
			folderId: DriveFolder['id'];
		};
		res: DriveFolder;
	};
	'drive/folders/update': {
		req: {
			folderId: DriveFolder['id'];
			name?: string;
			parentId?: DriveFolder['id'] | null;
		};
		res: DriveFolder;
	};
	'drive/stream': {
		req: {
			type?: DriveFile['type'] | null;
			limit?: number;
			sinceId?: DriveFile['id'];
			untilId?: DriveFile['id'];
		};
		res: DriveFile[];
	};

	// endpoint
	'endpoint': {
		req: {
			endpoint: string;
		};
		res: {
			params: {
				name: string;
				type: string;
			}[];
		};
	};

	// endpoints
	'endpoints': {
		req: NoParams;
		res: string[];
	};

	// federation
	'federation/dns': {
		req: {
			host: string;
		};
		res: {
			a: string[];
			aaaa: string[];
			cname: string[];
			txt: string[];
		};
	};
	'federation/followers': {
		req: {
			host: string;
			limit?: number;
			sinceId?: Following['id'];
			untilId?: Following['id'];
		};
		res: FollowingFolloweePopulated[];
	};
	'federation/following': {
		req: {
			host: string;
			limit?: number;
			sinceId?: Following['id'];
			untilId?: Following['id'];
		};
		res: FollowingFolloweePopulated[];
	};
	'federation/instances': {
		req: {
			host?: string | null;
			blocked?: boolean | null;
			notResponding?: boolean | null;
			suspended?: boolean | null;
			federating?: boolean | null;
			subscribing?: boolean | null;
			publishing?: boolean | null;
			limit?: number;
			offset?: number;
			sort?: '+pubSub' | '-pubSub' | '+notes' | '-notes' | '+users' | '-users' | '+following' | '-following' | '+followers' | '-followers' | '+caughtAt' | '-caughtAt' | '+lastCommunicatedAt' | '-lastCommunicatedAt' | '+driveUsage' | '-driveUsage' | '+driveFiles' | '-driveFiles';
		};
		res: Instance[];
	};
	'federation/show-instance': {
		req: {
			host: string;
		};
		res: Instance;
	};
	'federation/update-remote-user': {
		req: {
			userId: User['id'];
		};
		res: null;
	};
	'federation/users': {
		req: {
			host: string;
			limit?: number;
			sinceId?: User['id'];
			untilId?: User['id'];
		};
		res: UserDetailed[];
	};

	// following
	'following/create': {
		req: {
			userId: User['id'];
		};
		res: User;
	};
	'following/delete': {
		req: {
			userId: User['id'];
		};
		res: User;
	};
	'following/requests/accept': {
		req: {
			userId: User['id'];
		};
		res: null;
	};
	'following/requests/cancel': {
		req: {
			userId: User['id'];
		};
		res: User;
	};
	'following/requests/list': {
		req: NoParams;
		res: FollowRequest[];
	};
	'following/requests/reject': {
		req: {
			userId: User['id'];
		};
		res: null;
	};

	// gallery
	'gallery/featured': {
		req: NoParams;
		res: GalleryPost[];
	};
	'gallery/popular': {
		req: NoParams;
		res: GalleryPost[];
	};
	'gallery/posts': {
		req: {
			limit?: number;
			sinceId?: GalleryPost['id'];
			untilId?: GalleryPost['id'];
		};
		res: GalleryPost[];
	};
	'gallery/posts/create': {
		req: {
			title: GalleryPost['title'];
			description?: GalleryPost['description'];
			fileIds: GalleryPost['fileIds'];
			isSensitive?: GalleryPost['isSensitive'];
		};
		res: GalleryPost;
	};
	'gallery/posts/delete': {
		req: {
			postId: GalleryPost['id'];
		};
		res: null;
	};
	'gallery/posts/like': {
		req: {
			postId: GalleryPost['id'];
		};
		res: null;
	};
	'gallery/posts/show': {
		req: {
			postId: GalleryPost['id'];
		};
		res: GalleryPost;
	};
	'gallery/posts/unlike': {
		req: {
			postId: GalleryPost['id'];
		};
		res: null;
	};
	'gallery/posts/update': {
		req: {
			postId: GalleryPost['id'];
			title: GalleryPost['title'];
			description?: GalleryPost['description'];
			fileIds: GalleryPost['fileIds'];
			isSensitive?: GalleryPost['isSensitive'];
		};
		res: GalleryPost;
	};

	// games
	'games/reversi/games': {
		req: ReqTODO;
		res: ResTODO;
	};
	'games/reversi/games/show': {
		req: ReqTODO;
		res: ResTODO;
	};
	'games/reversi/games/surrender': {
		req: ReqTODO;
		res: ResTODO;
	};
	'games/reversi/invitations': {
		req: ReqTODO;
		res: ResTODO;
	};
	'games/reversi/match': {
		req: ReqTODO;
		res: ResTODO;
	};
	'games/reversi/match/cancel': {
		req: ReqTODO;
		res: ResTODO;
	};

	// get-online-users-count
	'get-online-users-count': {
		req: NoParams;
		res: {
			count: number;
		};
	};

	// hashtags
	'hashtags/list': {
		req: ReqTODO;
		res: ResTODO;
	};
	'hashtags/search': {
		req: ReqTODO;
		res: ResTODO;
	};
	'hashtags/show': {
		req: ReqTODO;
		res: ResTODO;
	};
	'hashtags/trend': {
		req: ReqTODO;
		res: ResTODO;
	};
	'hashtags/users': {
		req: ReqTODO;
		res: ResTODO;
	};

	// i
	'i': {
		req: NoParams;
		res: User;
	};
	'i/apps': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/authorized-apps': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/change-password': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/delete-account': {
		req: {
			password: string;
		};
		res: null;
	};
	'i/export-blocking': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/export-following': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/export-mute': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/export-notes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/export-user-lists': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/favorites': {
		req: {
			limit?: number;
			sinceId?: NoteFavorite['id'];
			untilId?: NoteFavorite['id'];
		};
		res: NoteFavorite[];
	};
	'i/gallery/likes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/gallery/posts': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/import-following': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/import-user-lists': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/move': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/notifications': {
		req: {
			limit?: number;
			sinceId?: Notification['id'];
			untilId?: Notification['id'];
			following?: boolean;
			markAsRead?: boolean;
			includeTypes?: Notification['type'][];
			excludeTypes?: Notification['type'][];
		};
		res: Notification[];
	};
	'i/page-likes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/pages': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/pin': {
		req: {
			noteId: Note['id'];
		};
		res: MeDetailed;
	};
	'i/read-all-messaging-messages': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/read-all-unread-notes': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/read-announcement': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/regenerate-token': {
		req: {
			password: string;
		};
		res: null;
	};
	'i/registry/get-all': {
		req: {
			scope?: string[];
		};
		res: Record<string, any>;
	};
	'i/registry/get-detail': {
		req: {
			key: string;
			scope?: string[];
		};
		res: {
			updatedAt: DateString;
			value: any;
		};
	};
	'i/registry/get': {
		req: {
			key: string;
			scope?: string[];
		};
		res: any;
	};
	'i/registry/keys-with-type': {
		req: {
			scope?: string[];
		};
		res: Record<string, 'null' | 'array' | 'number' | 'string' | 'boolean' | 'object'>;
	};
	'i/registry/keys': {
		req: {
			scope?: string[];
		};
		res: string[];
	};
	'i/registry/remove': {
		req: {
			key: string;
			scope?: string[];
		};
		res: null;
	};
	'i/registry/scopes': {
		req: NoParams;
		res: string[][];
	};
	'i/registry/set': {
		req: {
			key: string;
			value: any;
			scope?: string[];
		};
		res: null;
	};
	'i/revoke-token': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/signin-history': {
		req: {
			limit?: number;
			sinceId?: Signin['id'];
			untilId?: Signin['id'];
		};
		res: Signin[];
	};
	'i/unpin': {
		req: {
			noteId: Note['id'];
		};
		res: MeDetailed;
	};
	'i/update-email': {
		req: {
			password: string;
			email?: string | null;
		};
		res: MeDetailed;
	};
	'i/update': {
		req: {
			name?: string | null;
			description?: string | null;
			lang?: string | null;
			location?: string | null;
			birthday?: string | null;
			avatarId?: DriveFile['id'] | null;
			bannerId?: DriveFile['id'] | null;
			fields?: {
				name: string;
				value: string;
			}[];
			isLocked?: boolean;
			isExplorable?: boolean;
			hideOnlineStatus?: boolean;
			carefulBot?: boolean;
			autoAcceptFollowed?: boolean;
			noCrawle?: boolean;
			isBot?: boolean;
			isCat?: boolean;
			injectFeaturedNote?: boolean;
			receiveAnnouncementEmail?: boolean;
			alwaysMarkNsfw?: boolean;
			mutedWords?: string[][];
			notificationRecieveConfig?: any;
			emailNotificationTypes?: string[];
			alsoKnownAs?: string[];
		};
		res: MeDetailed;
	};
	'i/user-group-invites': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/done': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/key-done': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/password-less': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/register-key': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/register': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/remove-key': {
		req: ReqTODO;
		res: ResTODO;
	};
	'i/2fa/unregister': {
		req: ReqTODO;
		res: ResTODO;
	};

	// invite
	'invite/create': {
		req: NoParams;
		res: Invite;
	};
	'invite/delete': {
		req: {
			inviteId: Invite['id'];
		};
		res: null;
	};
	'invite/list': {
		req: {
			limit?: number;
			sinceId?: Invite['id'];
			untilId?: Invite['id'];
		};
		res: Invite[];
	};
	'invite/limit': {
		req: NoParams;
		res: InviteLimit;
	};

	// messaging
	'messaging/history': {
		req: {
			limit?: number;
			group?: boolean;
		};
		res: MessagingMessage[];
	};
	'messaging/messages': {
		req: {
			userId?: User['id'];
			groupId?: UserGroup['id'];
			limit?: number;
			sinceId?: MessagingMessage['id'];
			untilId?: MessagingMessage['id'];
			markAsRead?: boolean;
		};
		res: MessagingMessage[];
	};
	'messaging/messages/create': {
		req: {
			userId?: User['id'];
			groupId?: UserGroup['id'];
			text?: string;
			fileId?: DriveFile['id'];
		};
		res: MessagingMessage;
	};
	'messaging/messages/delete': {
		req: {
			messageId: MessagingMessage['id'];
		};
		res: null;
	};
	'messaging/messages/read': {
		req: {
			messageId: MessagingMessage['id'];
		};
		res: null;
	};

	// meta
	'meta': {
		req: {
			detail?: boolean;
		};
		res: {
			$switch: {
				$cases: [
					[
						{ detail: true; },
						DetailedInstanceMetadata,
					],
					[
						{ detail: false; },
						LiteInstanceMetadata,
					],
					[
						{ detail: boolean; },
						LiteInstanceMetadata | DetailedInstanceMetadata,
					],
				];
				$default: LiteInstanceMetadata;
			};
		};
	};

	// miauth
	'miauth/gen-token': {
		req: ReqTODO;
		res: ResTODO;
	};

	// mute
	'mute/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'mute/delete': {
		req: {
			userId: User['id'];
		};
		res: null;
	};
	'mute/list': {
		req: ReqTODO;
		res: ResTODO;
	};

	// my
	'my/apps': {
		req: ReqTODO;
		res: ResTODO;
	};

	// notes
	'notes': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
		};
		res: Note[];
	};
	'notes/children': {
		req: {
			noteId: Note['id'];
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
		};
		res: Note[];
	};
	'notes/clips': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/conversation': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/create': {
		req: {
			visibility?: 'public' | 'home' | 'followers' | 'specified';
			visibleUserIds?: User['id'][];
			text?: null | string;
			cw?: null | string;
			viaMobile?: boolean;
			localOnly?: boolean;
			fileIds?: DriveFile['id'][];
			replyId?: null | Note['id'];
			renoteId?: null | Note['id'];
			channelId?: null | Channel['id'];
			poll?: null | {
				choices: string[];
				multiple?: boolean;
				expiresAt?: null | number;
				expiredAfter?: null | number;
			};
		};
		res: {
			createdNote: Note;
		};
	};
	'notes/delete': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};
	'notes/favorites/create': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};
	'notes/favorites/delete': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};
	'notes/featured': {
		req: ReqTODO;
		res: Note[];
	};
	'notes/global-timeline': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'notes/hybrid-timeline': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'notes/local-timeline': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'notes/mentions': {
		req: {
			following?: boolean;
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
		};
		res: Note[];
	};
	'notes/polls/recommendation': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/polls/vote': {
		req: {
			noteId: Note['id'];
			choice: number;
		};
		res: null;
	};
	'notes/reactions': {
		req: {
			noteId: Note['id'];
			type?: string | null;
			limit?: number;
		};
		res: NoteReaction[];
	};
	'notes/reactions/create': {
		req: {
			noteId: Note['id'];
			reaction: string;
		};
		res: null;
	};
	'notes/reactions/delete': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};
	'notes/renotes': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			noteId: Note['id'];
		};
		res: Note[];
	};
	'notes/replies': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			noteId: Note['id'];
		};
		res: Note[];
	};
	'notes/search-by-tag': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/search': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/show': {
		req: {
			noteId: Note['id'];
		};
		res: Note;
	};
	'notes/state': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/timeline': {
		req: {
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'notes/unrenote': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};
	'notes/user-list-timeline': {
		req: {
			listId: UserList['id'];
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'notes/watching/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'notes/watching/delete': {
		req: {
			noteId: Note['id'];
		};
		res: null;
	};

	// notifications
	'notifications/create': {
		req: {
			body: string;
			header?: string | null;
			icon?: string | null;
		};
		res: null;
	};
	'notifications/test-notification': {
		req: NoParams;
		res: null;
	};
	'notifications/mark-all-as-read': {
		req: NoParams;
		res: null;
	};

	// page-push
	'page-push': {
		req: {
			pageId: Page['id'];
			event: string;
			var?: any;
		};
		res: null;
	};

	// pages
	'pages/create': {
		req: ReqTODO;
		res: Page;
	};
	'pages/delete': {
		req: {
			pageId: Page['id'];
		};
		res: null;
	};
	'pages/featured': {
		req: NoParams;
		res: Page[];
	};
	'pages/like': {
		req: {
			pageId: Page['id'];
		};
		res: null;
	};
	'pages/show': {
		req: {
			pageId?: Page['id'];
			name?: string;
			username?: string;
		};
		res: Page;
	};
	'pages/unlike': {
		req: {
			pageId: Page['id'];
		};
		res: null;
	};
	'pages/update': {
		req: ReqTODO;
		res: null;
	};

	// ping
	'ping': {
		req: NoParams;
		res: {
			pong: number;
		};
	};

	// pinned-users
	'pinned-users': {
		req: ReqTODO;
		res: ResTODO;
	};

	// promo
	'promo/read': {
		req: ReqTODO;
		res: ResTODO;
	};

	// request-reset-password
	'request-reset-password': {
		req: {
			username: string;
			email: string;
		};
		res: null;
	};

	// reset-password
	'reset-password': {
		req: {
			token: string;
			password: string;
		};
		res: null;
	};

	// room
	'room/show': {
		req: ReqTODO;
		res: ResTODO;
	};
	'room/update': {
		req: ReqTODO;
		res: ResTODO;
	};

	// signup
	'signup': {
		req: {
			username: string;
			password: string;
			host?: string;
			invitationCode?: string;
			emailAddress?: string;
			'hcaptcha-response'?: string;
			'g-recaptcha-response'?: string;
			'turnstile-response'?: string;
		};
		res: MeSignup | null;
	};

	// stats
	'stats': {
		req: NoParams;
		res: Stats;
	};

	// server-info
	'server-info': {
		req: NoParams;
		res: ServerInfo;
	};

	// sw
	'sw/register': {
		req: ReqTODO;
		res: ResTODO;
	};

	// username
	'username/available': {
		req: {
			username: string;
		};
		res: {
			available: boolean;
		};
	};

	// users
	'users': {
		req: {
			limit?: number;
			offset?: number;
			sort?: UserSorting;
			origin?: OriginType;
		};
		res: User[];
	};
	'users/clips': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/followers': {
		req: {
			userId?: User['id'];
			username?: User['username'];
			host?: User['host'] | null;
			limit?: number;
			sinceId?: Following['id'];
			untilId?: Following['id'];
		};
		res: FollowingFollowerPopulated[];
	};
	'users/following': {
		req: {
			userId?: User['id'];
			username?: User['username'];
			host?: User['host'] | null;
			limit?: number;
			sinceId?: Following['id'];
			untilId?: Following['id'];
		};
		res: FollowingFolloweePopulated[];
	};
	'users/gallery/posts': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/get-frequently-replied-users': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/create': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/delete': {
		req: {
			groupId: UserGroup['id'];
		};
		res: null;
	};
	'users/groups/invitations/accept': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/invitations/reject': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/invite': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/joined': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/owned': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/pull': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/show': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/transfer': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/groups/update': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/lists/create': {
		req: {
			name: string;
		};
		res: UserList;
	};
	'users/lists/delete': {
		req: {
			listId: UserList['id'];
		};
		res: null;
	};
	'users/lists/list': {
		req: NoParams;
		res: UserList[];
	};
	'users/lists/pull': {
		req: {
			listId: UserList['id'];
			userId: User['id'];
		};
		res: null;
	};
	'users/lists/push': {
		req: {
			listId: UserList['id'];
			userId: User['id'];
		};
		res: null;
	};
	'users/lists/show': {
		req: {
			listId: UserList['id'];
		};
		res: UserList;
	};
	'users/lists/update': {
		req: {
			listId: UserList['id'];
			name: string;
		};
		res: UserList;
	};
	'users/notes': {
		req: {
			userId: User['id'];
			limit?: number;
			sinceId?: Note['id'];
			untilId?: Note['id'];
			sinceDate?: number;
			untilDate?: number;
		};
		res: Note[];
	};
	'users/pages': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/flashs': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/recommendation': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/relation': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/report-abuse': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/search-by-username-and-host': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/search': {
		req: ReqTODO;
		res: ResTODO;
	};
	'users/show': {
		req: {
			username: string;
			host?: string;
		} | {
			userId: User['id'];
		} | {
			userIds: User['id'][];
		};
		res: {
			$switch: {
				$cases: [
					[
						{ userIds: User['id'][]; },
						UserDetailed[],
					],
				];
				$default: UserDetailed;
			};
		};
	};
};
