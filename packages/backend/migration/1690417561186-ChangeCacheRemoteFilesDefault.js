/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ChangeCacheRemoteFilesDefault1690417561186 {
    name = 'ChangeCacheRemoteFilesDefault1690417561186'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "cacheRemoteFiles" SET DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "cacheRemoteFiles" SET DEFAULT true`);
    }
}
