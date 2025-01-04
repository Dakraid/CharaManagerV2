<script setup lang="ts">
import { Filter } from 'lucide-vue-next';
import { ComparisonOperator } from '~/utils/Interfaces';
</script>

<template>
    <div class="flex flex-nowrap gap-1">
        <Input class="w-full" placeholder="Search by name..." />
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button variant="outline">
                    <Filter class="h-[1.2rem] w-[1.2rem]" />
                    <span class="sr-only">Filter Options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel class="flex gap-2">
                    <span class="text-muted-foreground">Leave any empty or null to ignore.</span>
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        type="number"
                        label="Filter by ID"
                        :options="[
                            ComparisonOperator.Equal,
                            ComparisonOperator.NotEqual,
                            ComparisonOperator.GreaterOrEqual,
                            ComparisonOperator.LessOrEqual,
                            ComparisonOperator.Greater,
                            ComparisonOperator.Less,
                            ComparisonOperator.Between,
                            ComparisonOperator.Outside,
                        ]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        type="string"
                        label="Filter by Description"
                        :options="[ComparisonOperator.Equal, ComparisonOperator.NotEqual, ComparisonOperator.Like, ComparisonOperator.Cosine]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls type="string" label="Filter by Filename" :options="[ComparisonOperator.Equal, ComparisonOperator.NotEqual, ComparisonOperator.Like]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        type="date"
                        label="Filter by Upload Date"
                        :options="[
                            ComparisonOperator.Equal,
                            ComparisonOperator.NotEqual,
                            ComparisonOperator.GreaterOrEqual,
                            ComparisonOperator.LessOrEqual,
                            ComparisonOperator.Greater,
                            ComparisonOperator.Less,
                            ComparisonOperator.Between,
                            ComparisonOperator.Outside,
                        ]" />
                </DropdownMenuLabel>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>

<style scoped></style>
