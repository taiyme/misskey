/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { Injectable } from '@nestjs/common';
import { IdentifiableError } from '@/misc/identifiable-error.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { DriveFileEntityService } from '@/core/entities/DriveFileEntityService.js';
import { MetaService } from '@/core/MetaService.js';
import { DriveService } from '@/core/DriveService.js';
import { ApiError } from '../../../error.js';
import { DB_MAX_IMAGE_COMMENT_LENGTH } from '@/const.js';

export const meta = {
	tags: ['drive'],

	requireCredential: true,

	prohibitMoved: true,

	limit: {
		duration: ms('1hour'),
		max: 60,
	},

	kind: 'write:drive',

	description: 'Request the server to download a new drive file from the specified URL.',

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'DriveFile',
	},

	errors: {
		inappropriate: {
			message: 'Cannot upload the file because it has been determined that it possibly contains inappropriate content.',
			code: 'INAPPROPRIATE',
			id: '8eb55988-6b8b-4e0f-8d38-97e8b5e112a0',
		},

		noFreeSpace: {
			message: 'Cannot upload the file because you have no free space of drive.',
			code: 'NO_FREE_SPACE',
			id: '70e6b8ac-d2e6-4646-a5e5-a5a54525c133',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		url: { type: 'string' },
		folderId: { type: 'string', format: 'misskey:id', nullable: true, default: null },
		isSensitive: { type: 'boolean', default: false },
		comment: { type: 'string', nullable: true, maxLength: DB_MAX_IMAGE_COMMENT_LENGTH, default: null },
		marker: { type: 'string', nullable: true, default: null },
		force: { type: 'boolean', default: false },
	},
	required: ['url'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private driveFileEntityService: DriveFileEntityService,
		private metaService: MetaService,
		private driveService: DriveService,
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, user, _1, _2, _3, ip, headers) => {
			const instance = await this.metaService.fetch();

			try {
				const driveFile = await this.driveService.uploadFromUrl({
					url: ps.url,
					user,
					folderId: ps.folderId,
					sensitive: ps.isSensitive,
					force: ps.force,
					comment: ps.comment,
					requestIp: instance.enableIpLogging ? ip : null,
					requestHeaders: instance.enableIpLogging ? headers : null,
				});
				const packedFile = await this.driveFileEntityService.pack(driveFile, { self: true });
				this.globalEventService.publishMainStream(user.id, 'urlUploadFinished', {
					marker: ps.marker,
					file: packedFile,
				});
				return packedFile;
			} catch (err) {
				if (err instanceof Error || typeof err === 'string') {
					console.error(err);
				}
				if (err instanceof IdentifiableError) {
					if (err.id === '282f77bf-5816-4f72-9264-aa14d8261a21') throw new ApiError(meta.errors.inappropriate);
					if (err.id === 'c6244ed2-a39a-4e1c-bf93-f0fbd7764fa6') throw new ApiError(meta.errors.noFreeSpace);
				}
				throw new ApiError();
			}
		});
	}
}
