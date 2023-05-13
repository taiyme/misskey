import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TmsCustomImage {
	@PrimaryColumn()
	public id: number;

	@Column('varchar', {
		length: 512,
		default: 'https://xn--931a.moe/assets/info.jpg',
	})
	public infoImageURL: string;

	@Column('varchar', {
		length: 512,
		default: 'https://xn--931a.moe/assets/not-found.jpg',
	})
	public notFoundImageURL: string;

	@Column('varchar', {
		length: 512,
		default: 'https://xn--931a.moe/assets/error.jpg',
	})
	public errorImageURL: string;

	@Column('varchar', {
		length: 512,
		default: '/static-assets/icons/192.png',
	})
	public pwaIcon192URL: string;

	@Column('varchar', {
		length: 512,
		default: '/static-assets/icons/512.png',
	})
	public pwaIcon512URL: string;
}
