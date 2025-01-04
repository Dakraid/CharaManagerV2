<script setup lang="ts">
import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';
import { ref } from 'vue';
import { cn } from '~/lib/utils';

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
});

const props = defineProps<{
    class?: HTMLAttributes['class'];
    label?: string;
    placeholder?: string;
    type: string;
    options: ComparisonOperator[];
}>();

const selection = ref<ComparisonOperator>(props.options[0]);
const queryPrimary = ref<any>();
const querySecondary = ref<any>();

const emit = defineEmits(['update:queryPrimary', 'update:querySecondary']);

watch(queryPrimary, (newValue) => {
    emit('update:queryPrimary', newValue);
});

watch(querySecondary, (newValue) => {
    emit('update:querySecondary', newValue);
});
</script>

<template>
    <div :class="cn('relative flex flex-col gap-2 w-full max-w-sm items-center', props.class)">
        <Label for="search" class="w-full"> {{ label != null ? label : 'Search...' }}</Label>
        <div class="w-full">
            <div v-if="type === 'number'">
                <Transition>
                    <div v-if="selection === ComparisonOperator.Between || selection === ComparisonOperator.Outside" id="search" class="flex flex-col flex-nowrap">
                        <NumberField :default-value="0" :min="0" :max="querySecondary" :model-value="queryPrimary">
                            <NumberFieldContent class="[&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-12">
                                <NumberFieldDecrement class="pl-12" />
                                <NumberFieldInput class="rounded-b-none" />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>

                        <NumberField :default-value="1" :min="queryPrimary" :model-value="querySecondary">
                            <NumberFieldContent class="[&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-12">
                                <NumberFieldDecrement class="pl-12" />
                                <NumberFieldInput class="rounded-t-none border-t-0" />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>
                    </div>

                    <NumberField v-else id="search" :default-value="0" :min="0" :model-value="queryPrimary">
                        <NumberFieldContent class="[&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-12">
                            <NumberFieldDecrement class="pl-12" />
                            <NumberFieldInput />
                            <NumberFieldIncrement />
                        </NumberFieldContent>
                    </NumberField>
                </Transition>
            </div>

            <div v-else-if="type === 'date'">
                <Transition>
                    <div v-if="selection === ComparisonOperator.Between || selection === ComparisonOperator.Outside" id="search" class="flex flex-col flex-nowrap">
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    :class="cn('w-[280px] justify-start text-left font-normal pl-12 rounded-b-none', !queryPrimary && 'text-muted-foreground')">
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {{ queryPrimary ? df.format(queryPrimary.toDate(getLocalTimeZone())) : 'Pick a date' }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar v-model="queryPrimary" initial-focus />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    :class="cn('w-[280px] justify-start text-left font-normal pl-12 rounded-t-none border-t-0', !querySecondary && 'text-muted-foreground')">
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {{ querySecondary ? df.format(querySecondary.toDate(getLocalTimeZone())) : 'Pick a date' }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar v-model="querySecondary" initial-focus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Popover v-else>
                        <PopoverTrigger as-child>
                            <Button variant="outline" :class="cn('w-[280px] justify-start text-left font-normal pl-12', !queryPrimary && 'text-muted-foreground')">
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {{ queryPrimary ? df.format(queryPrimary.toDate(getLocalTimeZone())) : 'Pick a date' }}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0">
                            <Calendar v-model="queryPrimary" initial-focus />
                        </PopoverContent>
                    </Popover>
                </Transition>
            </div>

            <Input v-else id="search" class="pl-12" :placeholder="placeholder != null ? placeholder : 'Search...'" :model-value="queryPrimary" />

            <span
                :class="
                    cn(
                        'absolute start-0 inset-y-0 top-[22px] flex items-center justify-center',
                        selection === ComparisonOperator.Between || selection === ComparisonOperator.Outside ? 'top-[22px]' : ''
                    )
                ">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="w-[2.5rem] h-full rounded-r-none"> {{ comparisonOperatorSymbols[selection] }} </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-full max-w-sm" align="start">
                        <DropdownMenuLabel>Operator</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup v-model="selection">
                            <DropdownMenuRadioItem v-for="option in options" :key="option" :value="option">
                                <div class="grid grid-cols-[48px_1fr] gap-1">
                                    <span class="col-start-1 mx-auto">{{ comparisonOperatorSymbols[option] }}</span>
                                    <span class="col-start-2">({{ option }})</span>
                                </div>
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </span>
        </div>
    </div>
</template>

<style scoped></style>
