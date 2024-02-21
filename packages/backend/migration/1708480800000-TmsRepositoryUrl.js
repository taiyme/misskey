/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class TmsRepositoryUrl1708480800000 {
    name = 'TmsRepositoryUrl1708480800000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://github.com/taiyme/misskey'`);
        await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/taiyme/misskey' WHERE "repositoryUrl" = 'https://github.com/misskey-dev/misskey'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://github.com/taiyme/misskey/issues/new'`);
        await queryRunner.query(`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/taiyme/misskey/issues/new' WHERE "feedbackUrl" = 'https://github.com/misskey-dev/misskey/issues/new'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey'`);
        await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/misskey-dev/misskey' WHERE "repositoryUrl" = 'https://github.com/taiyme/misskey'`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey/issues/new'`);
        await queryRunner.query(`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/misskey-dev/misskey/issues/new' WHERE "feedbackUrl" = 'https://github.com/taiyme/misskey/issues/new'`);
    }
}
