/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class TaiymeServerCustomCss1739404800000 {
	name = 'TaiymeServerCustomCss1739404800000';

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "taiymeServerCustomCss" character varying(8192)`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "taiymeServerCustomCss"`);
	}
}
