/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { AchievementService, ACHIEVEMENT_TYPES } from '@/core/AchievementService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	requireCredential: true,
	prohibitMoved: true,
	kind: 'write:account',

	errors: {
		tmsAchievementsDisabled: {
			message: 'Achievements has been disabled.',
			code: 'TMS_ACHIEVEMENTS_DISABLED',
			id: '4675145b-6f2b-4760-95e1-2e91cf9afac4',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string', enum: ACHIEVEMENT_TYPES },
	},
	required: ['name'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private achievementService: AchievementService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me.id);
			if (!policies.tmsAchievementsAvailable) {
				throw new ApiError(meta.errors.tmsAchievementsDisabled);
			}

			await this.achievementService.create(me.id, ps.name);
		});
	}
}
