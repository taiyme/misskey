import { db } from '@/db/postgre.js';
import { Schema } from '@/misc/schema.js';
import { FetchCustomImage } from '@/misc/tms/fetch-custom-image';
import { TmsCustomImage } from '@/models/entities/tms/custom-image.js';
import define from '@/server/api/define.js';
import { IEndpointMeta } from '@/server/api/endpoints.js';

export const meta = {
	stability: 'experimental',
	tags: ['tms', 'admin'],
	requireCredential: true,
	requireAdmin: true,
	res: {
		type: 'object',
		optional: false,
		nullable: false,
		properties: {
			infoImageURL: {
				type: 'string',
				nullable: false,
				optional: false,
			},
			notFoundImageURL: {
				type: 'string',
				nullable: false,
				optional: false,
			},
			errorImageURL: {
				type: 'string',
				nullable: false,
				optional: false,
			},
			pwaIconType: {
				type: 'string',
				enum: ['default', 'custom'],
				nullable: false,
				optional: false,
			},
			pwaIcon192URL: {
				type: 'string',
				nullable: false,
				optional: false,
			},
			pwaIcon512URL: {
				type: 'string',
				nullable: false,
				optional: false,
			},
		},
	},
} as const satisfies IEndpointMeta;

export const paramDef = {
	type: 'object',
	properties: {
		infoImageURL: {
			type: 'string',
			nullable: false,
		},
		notFoundImageURL: {
			type: 'string',
			nullable: false,
		},
		errorImageURL: {
			type: 'string',
			nullable: false,
		},
		pwaIconType: {
			type: 'string',
			enum: ['default', 'custom'],
			nullable: false,
		},
		pwaIcon192URL: {
			type: 'string',
			nullable: false,
		},
		pwaIcon512URL: {
			type: 'string',
			nullable: false,
		},
	},
	required: [],
} as const satisfies Schema;

type Responce = {
	infoImageURL: string;
	notFoundImageURL: string;
	errorImageURL: string;
	pwaIconType: 'default' | 'custom';
	pwaIcon192URL: string;
	pwaIcon512URL: string;
};

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, _me): Promise<Responce> => {
	// 分割代入で不必要な要素idを取り除くためなので許容
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const { id: _, ...response } = await db.transaction(async (entityManager) => {
	const response = await db.transaction(async (entityManager) => {
		return await entityManager.upsert(TmsCustomImage, { id: 1, ...ps }, ['id']).then((x) =>
			entityManager.findOneByOrFail(TmsCustomImage, x.identifiers[0]),
		);
	});

	return response;
});
