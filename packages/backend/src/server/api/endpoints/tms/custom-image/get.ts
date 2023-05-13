import define from '@/server/api/define.js';
import { Schema } from '@/misc/schema.js';
import { IEndpointMeta } from '@/server/api/endpoints.js';
import { FetchCustomImage } from '@/misc/tms/fetch-custom-image.js';

export const meta = {
	stability: 'experimental',
	tags: ['tms', 'meta'],
	requireCredential: false,
	allowGet: true,
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
	properties: {},
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
export default define(meta, paramDef, async (_ps, _me): Promise<Responce> => {
	// 不必要な要素idを取り除くための分割代入なのでので許容
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { id: _, ...response } = await FetchCustomImage();

	return response;
});
