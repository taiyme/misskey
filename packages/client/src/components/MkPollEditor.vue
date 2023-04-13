<template>
<div class="zmdxowus">
	<p v-if="choices.length < 2" class="caution">
		<i class="ti ti-alert-triangle"></i>{{ i18n.ts._poll.noOnlyOneChoice }}
	</p>
	<ul>
		<li v-for="(choice, i) in choices" :key="i">
			<MkInput class="input" small :model-value="choice" :placeholder="i18n.t('_poll.choiceN', { n: i + 1 })" @update:model-value="onInput(i, $event as string)"/>
			<button class="_button" @click="remove(i)">
				<i class="ti ti-x"></i>
			</button>
		</li>
	</ul>
	<MkButton v-if="choices.length < 10" class="add" @click="add">{{ i18n.ts.add }}</MkButton>
	<MkButton v-else class="add" disabled>{{ i18n.ts._poll.noMore }}</MkButton>
	<MkSwitch v-model="multiple">{{ i18n.ts._poll.canMultipleVote }}</MkSwitch>
	<section>
		<div>
			<MkSelect v-model="expiration" small>
				<template #label>{{ i18n.ts._poll.expiration }}</template>
				<option value="infinite">{{ i18n.ts._poll.infinite }}</option>
				<option value="at">{{ i18n.ts._poll.at }}</option>
				<option value="after">{{ i18n.ts._poll.after }}</option>
			</MkSelect>
			<section v-if="expiration === 'at'">
				<MkInput v-model="atDate" small type="date" class="input">
					<template #label>{{ i18n.ts._poll.deadlineDate }}</template>
				</MkInput>
				<MkInput v-model="atTime" small type="time" class="input">
					<template #label>{{ i18n.ts._poll.deadlineTime }}</template>
				</MkInput>
			</section>
			<section v-else-if="expiration === 'after'">
				<MkInput v-model="after" small type="number" class="input">
					<template #label>{{ i18n.ts._poll.duration }}</template>
				</MkInput>
				<MkSelect v-model="unit" small>
					<option value="second">{{ i18n.ts._time.second }}</option>
					<option value="minute">{{ i18n.ts._time.minute }}</option>
					<option value="hour">{{ i18n.ts._time.hour }}</option>
					<option value="day">{{ i18n.ts._time.day }}</option>
				</MkSelect>
			</section>
		</div>
	</section>
</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import MkInput from './form/input.vue';
import MkSelect from './form/select.vue';
import MkSwitch from './form/switch.vue';
import MkButton from './MkButton.vue';
import { formatDateTimeString } from '@/scripts/format-time-string';
import { addTime } from '@/scripts/time';
import { i18n } from '@/i18n';

export type EditedPoll = {
	choices: string[];
	multiple: boolean;
	expiresAt: number | null;
	expiredAfter: number | null;
};

const props = defineProps<{
	modelValue: EditedPoll;
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', v: EditedPoll): void;
}>();

const choices = ref(props.modelValue.choices);
const multiple = ref(props.modelValue.multiple);
const expiration = ref('infinite');
const atDate = ref(formatDateTimeString(addTime(new Date(), 1, 'day'), 'yyyy-MM-dd'));
const atTime = ref('00:00');
const after = ref(0);
const unit = ref<'day' | 'hour' | 'minute' | 'second'>('second');

if (props.modelValue.expiresAt) {
	expiration.value = 'at';
	atDate.value = formatDateTimeString(new Date(props.modelValue.expiresAt), 'yyyy-MM-dd');
	atTime.value = formatDateTimeString(new Date(props.modelValue.expiresAt), 'HH:mm');
} else if (typeof props.modelValue.expiredAfter === 'number') {
	expiration.value = 'after';
	if (props.modelValue.expiredAfter % 86400000 === 0) {
		unit.value = 'day';
		after.value = props.modelValue.expiredAfter / 86400000;
	} else if (props.modelValue.expiredAfter % 3600000 === 0) {
		unit.value = 'hour';
		after.value = props.modelValue.expiredAfter / 3600000;
	} else if (props.modelValue.expiredAfter % 60000 === 0) {
		unit.value = 'minute';
		after.value = props.modelValue.expiredAfter / 60000;
	} else {
		unit.value = 'second';
		after.value = props.modelValue.expiredAfter / 1000;
	}
} else {
	expiration.value = 'infinite';
}

const onInput = (i: number, value: string): void => {
	choices.value[i] = value;
};

const add = (): void => {
	choices.value.push('');
};

const remove = (i: number): void => {
	choices.value = choices.value.filter((_, _i) => _i !== i);
};

const get = (): EditedPoll => {
	const calcAt = (): number | null => {
		const unixtime = new Date(`${atDate.value} ${atTime.value}`).getTime();
		if (Number.isNaN(unixtime)) return null;
		return unixtime;
	};

	const calcAfter = (): number | null => {
		switch (unit.value) {
			case 'day': return after.value * 86400000;
			case 'hour': return after.value * 3600000;
			case 'minute': return after.value * 60000;
			case 'second': return after.value * 1000;
			default: return null;
		}
	};

	return {
		choices: choices.value,
		multiple: multiple.value,
		expiresAt: expiration.value === 'at' ? calcAt() : null,
		expiredAfter: expiration.value === 'after' ? calcAfter() : null,
	};
};

watch([choices, multiple, expiration, atDate, atTime, after, unit], () => emit('update:modelValue', get()), {
	deep: true,
});
</script>

<style lang="scss" scoped>
.zmdxowus {
	padding: 8px 16px;

	> .caution {
		margin: 0 0 8px 0;
		font-size: 0.8em;
		color: #f00;

		> i {
			margin-right: 4px;
		}
	}

	> ul {
		display: block;
		margin: 0;
		padding: 0;
		list-style: none;

		> li {
			display: flex;
			margin: 8px 0;
			padding: 0;
			width: 100%;

			> .input {
				flex: 1;
			}

			> button {
				width: 32px;
				padding: 4px 0;
			}
		}
	}

	> .add {
		margin: 8px 0;
		z-index: 1;
	}

	> section {
		margin: 16px 0 0 0;

		> div {
			margin: 0 8px;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 12px;

			&:last-child {
				flex: 1 0 auto;

				> div {
					flex-grow: 1;
				}

				> section {
					// MAGIC: Prevent div above from growing unless wrapped to its own line
					flex-grow: 9999;
					align-items: end;
					display: flex;
					gap: 4px;

					> .input {
						flex: 1 1 auto;
					}
				}
			}
		}
	}
}
</style>
