import { db } from '@/db/postgre.js';
import { Schema } from '@/misc/schema.js';
import { TmsCustomImage } from '@/models/entities/tms/custom-image.js';
import define from '@/server/api/define.js';
import { IEndpointMeta } from '@/server/api/endpoints.js';
import { ApiError } from '@/server/api/error.js';

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
				format: 'url',
			},
			notFoundImageURL: {
				type: 'string',
				nullable: false,
				optional: false,
				format: 'url',
			},
			errorImageURL: {
				type: 'string',
				nullable: false,
				optional: false,
				format: 'url',
			},
			pwaIcon192URL: {
				type: 'string',
				nullable: false,
				optional: false,
				format: 'url',
			},
			pwaIcon512URL: {
				type: 'string',
				nullable: false,
				optional: false,
				format: 'url',
			},
		},
	},
	errors: {
		invalidUrl: {
			message: 'Invalid URL',
			code: 'INVALID_PARAM',
			id: '6df120b9-0291-8248-c0d4-f8ec52182359',
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
	pwaIcon192URL: string;
	pwaIcon512URL: string;
};

// そろそろno-default-exportを消してもいいかもしれない
// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, _me): Promise<Responce> => {
	const params = (({ infoImageURL, notFoundImageURL, errorImageURL, pwaIcon192URL, pwaIcon512URL }): { infoImageURL: string | undefined, notFoundImageURL: string | undefined, errorImageURL: string | undefined, pwaIcon192URL: string | undefined, pwaIcon512URL: string | undefined; } => ({ infoImageURL, notFoundImageURL, errorImageURL, pwaIcon192URL, pwaIcon512URL }))(ps);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && !(new RegExp(/^https?:\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+$/).test(value))) {
			throw new ApiError(meta.errors.invalidUrl, { key, value });
		}
	}

	// 不必要な要素idを取り除くための分割代入なのでので許容
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { id: _, ...response } = await db.transaction(async (entityManager) => {
		return await entityManager.upsert(TmsCustomImage, { id: 1, ...ps }, ['id']).then((x) =>
			entityManager.findOneByOrFail(TmsCustomImage, x.identifiers[0]),
		);
	});

	return response;
});
