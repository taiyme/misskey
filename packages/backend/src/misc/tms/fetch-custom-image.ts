import { db } from '@/db/postgre.js';
import { TmsCustomImage } from '@/models/entities/tms/custom-image.js';

export const FetchCustomImage = async (): Promise<TmsCustomImage> => {
	return await db.transaction(async (entityManager) => {
		const customImage = await entityManager.find(TmsCustomImage, {
			take: 1,
			order: {
				id: 'ASC',
			},
		});

		if (customImage[0]) return customImage[0];

		return await entityManager
			.upsert(TmsCustomImage, {}, ['id'])
			.then((x) =>
				entityManager.findOneByOrFail(TmsCustomImage, x.identifiers[0]),
			);
	});
};
