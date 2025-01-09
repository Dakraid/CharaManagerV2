<script setup lang="ts">
import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';
import { cn } from '~/lib/utils';

const from = defineModel<any>('from', { required: true });
const to = defineModel<any>('to');
const operator = defineModel<ComparisonOperator>('operator', { required: true });

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
});

const props = defineProps<{
    type: string;
    label?: string;
    hideLabel?: boolean;
    placeholder?: string;
    hardCorners?: boolean;
    class?: HTMLAttributes['class'];
    options: ComparisonOperator[];
}>();
</script>

<template>
    <div :class="cn('relative w-full max-w-sm items-center', hideLabel ? 'Container-NoLabel' : 'Container-Label', props.class)">
        <Label v-if="!hideLabel" class="Label w-full"> {{ label != null ? label : 'Search...' }}</Label>

        <div v-if="type === 'number'" class="Control">
            <div v-if="operator === ComparisonOperator.Between || operator === ComparisonOperator.Outside" class="flex flex-col flex-nowrap">
                <Input v-model="from" type="number" class="Control pl-[52px] border-b-0 rounded-b-none" :placeholder="placeholder != null ? placeholder : '...'" />
                <Input v-model="to" type="number" class="Control pl-[52px] rounded-t-none" :placeholder="placeholder != null ? placeholder : '...'" />
            </div>

            <Input
                v-else
                v-model="from"
                :disabled="operator === ComparisonOperator.Disabled"
                type="number"
                class="Control pl-[52px]"
                :placeholder="placeholder != null ? placeholder : '...'" />
        </div>

        <div v-else-if="type === 'date'" class="Control">
            <div v-if="operator === ComparisonOperator.Between || operator === ComparisonOperator.Outside" class="flex flex-col flex-nowrap">
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-[280px] justify-start text-left font-normal pl-[52px] rounded-b-none', !from && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ from ? df.format(from.toDate(getLocalTimeZone())) : 'Pick a date' }}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                        <Calendar v-model="from" initial-focus />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-[280px] justify-start text-left font-normal rounded-t-none border-t-0 pl-[52px]', !to && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ to ? df.format(to.toDate(getLocalTimeZone())) : 'Pick a date' }}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                        <Calendar v-model="to" initial-focus />
                    </PopoverContent>
                </Popover>
            </div>

            <Popover v-else>
                <PopoverTrigger as-child>
                    <Button
                        variant="outline"
                        :disabled="operator === ComparisonOperator.Disabled"
                        :class="cn('w-[280px] justify-start text-left font-normal pl-[52px]', !from && 'text-muted-foreground')">
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{ from ? df.format(from.toDate(getLocalTimeZone())) : 'Pick a date' }}
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                    <Calendar v-model="from" initial-focus />
                </PopoverContent>
            </Popover>
        </div>

        <Input
            v-else
            v-model="from"
            :disabled="operator === ComparisonOperator.Disabled"
            :class="cn('Control pl-[52px]', hardCorners ? 'rounded-none' : '')"
            :placeholder="placeholder != null ? placeholder : '...'" />

        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button variant="outline" :class="cn('Button w-10 h-full rounded-r-none z-10', hardCorners ? 'rounded-none' : '')">
                    {{ comparisonOperatorSymbols[operator] }}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-full max-w-sm" align="start">
                <DropdownMenuLabel>Operator</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup v-model="operator">
                    <DropdownMenuRadioItem v-for="option in options" :key="option" :value="option">
                        <div class="grid grid-cols-[28px_1fr] gap-1">
                            <span class="col-start-1 mx-auto">{{ comparisonOperatorSymbols[option] }}</span>
                            <span class="col-start-2">({{ option }})</span>
                        </div>
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>

<style scoped>
.Container-Label {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    grid-template-rows: min-content min-content;
    gap: 0.5rem 0;
}

.Container-NoLabel {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    grid-template-rows: 0 min-content;
    gap: 0;
}

.Label {
    grid-area: 1 / 1 / 2 / 3;
}

.Button {
    grid-area: 2 / 1 / 3 / 2;
}

.Control {
    grid-area: 2 / 1 / 3 / 3;
}
</style>
