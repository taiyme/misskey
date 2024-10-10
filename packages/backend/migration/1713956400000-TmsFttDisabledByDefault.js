/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class TmsFttDisabledByDefault1713956400000 {
    name = 'TmsFttDisabledByDefault1713956400000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "enableFanoutTimeline" SET DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "enableFanoutTimeline" SET DEFAULT true`);
    }
}
