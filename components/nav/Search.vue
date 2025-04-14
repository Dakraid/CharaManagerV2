<script setup lang="ts">
import dayjs from 'dayjs';
import { Filter, FilterX, SendHorizonal } from 'lucide-vue-next';
import { debounce } from 'perfect-debounce';

const nuxtApp = useNuxtApp();
const appStore = useAppStore();
const characterStore = useCharacterStore();

const searchFlags = ref<SearchFlags>();
const filterActive = ref<boolean>(false);

const nameFrom = ref<any>();
const nameOp = ref<stringType>(ComparisonOperator.Equal);

const idFrom = ref<any>();
const idTo = ref<any>();
const idOp = ref<numericalType>(ComparisonOperator.Disabled);

const descFrom = ref<any>();
const descOp = ref<embeddingType>(ComparisonOperator.Disabled);

const fileNameFrom = ref<any>();
const fileNameOp = ref<stringType>(ComparisonOperator.Disabled);

const dateFrom = ref<any>();
const dateTo = ref<any>();
const dateOp = ref<numericalType>(ComparisonOperator.Disabled);

async function onSubmit() {
    searchFlags.value = {
        id: {
            from: idFrom.value,
            to: idTo.value,
            option: idOp.value,
        },
        name: {
            query: nameFrom.value,
            option: nameOp.value,
        },
        desc: {
            query: descFrom.value,
            threshold: 0.9,
            option: descOp.value,
        },
        fileName: {
            query: fileNameFrom.value,
            option: fileNameOp.value,
        },
        uploadDate: {
            from: dayjs(dateFrom.value).unix(),
            to: dayjs(dateTo.value).unix(),
            option: dateOp.value,
        },
    };

    characterStore.loading = true;
    const debounceSearch = debounce(async () => {
        const { data } = await useFetch<Character[]>('/api/chars/search', {
            method: 'POST',
            body: {
                page: characterStore.currentPage,
                perPage: appStore.perPage,
                searchFlags: searchFlags.value,
            },
        });

        characterStore.count = data.value?.length ?? 0;
        characterStore.characters = data.value ?? undefined;
    }, 300);

    await debounceSearch();
    characterStore.loading = false;
    filterActive.value = true;
}

async function OnClear() {
    searchFlags.value = undefined;
    nameFrom.value = undefined;
    idFrom.value = undefined;
    idTo.value = undefined;
    descFrom.value = undefined;
    fileNameFrom.value = undefined;
    dateFrom.value = undefined;
    dateTo.value = undefined;

    nameOp.value = ComparisonOperator.Equal;
    idOp.value = ComparisonOperator.Disabled;
    descOp.value = ComparisonOperator.Disabled;
    fileNameOp.value = ComparisonOperator.Disabled;
    dateOp.value = ComparisonOperator.Disabled;

    await characterStore.refreshCharacters();
    filterActive.value = false;
}
</script>

<template>
    <div class="flex flex-nowrap gap-0">
        <Transition>
            <Button v-if="filterActive" id="clear" type="submit" variant="destructive" class="border-r-0 rounded-r-none" @click="OnClear">
                <span class="sr-only">Clear</span>
                <FilterX class="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </Transition>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button variant="outline" :class="filterActive ? 'border-x-0 rounded-none' : 'border-l-1 border-r-0 rounded-r-none'">
                    <Filter class="h-[1.2rem] w-[1.2rem]" />
                    <span class="sr-only">Filter Options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel class="flex flex-col gap-2 z-30">
                    <span class="text-muted-foreground">Leave any empty or null to ignore.</span>
                    <span class="text-muted-foreground">Between/Outside are range selections.</span>
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        v-model:from="idFrom"
                        v-model:to="idTo"
                        v-model:operator="idOp"
                        type="number"
                        label="Filter by ID"
                        placeholder="Enter id..."
                        :options="[
                            ComparisonOperator.Disabled,
                            ComparisonOperator.Equal,
                            ComparisonOperator.NotEqual,
                            ComparisonOperator.GreaterOrEqual,
                            ComparisonOperator.LessOrEqual,
                            ComparisonOperator.Greater,
                            ComparisonOperator.Less,
                            ComparisonOperator.Between,
                        ]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        v-model:from="descFrom"
                        v-model:operator="descOp"
                        type="string"
                        label="Filter by Description"
                        placeholder="Enter description..."
                        :options="[
                            ComparisonOperator.Disabled,
                            ComparisonOperator.Equal,
                            ComparisonOperator.NotEqual,
                            ComparisonOperator.Like,
                            ComparisonOperator.Unlike,
                            ComparisonOperator.Cosine,
                        ]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        v-model:from="fileNameFrom"
                        v-model:operator="fileNameOp"
                        type="string"
                        label="Filter by Filename"
                        placeholder="Enter filename..."
                        :options="[ComparisonOperator.Disabled, ComparisonOperator.Equal, ComparisonOperator.NotEqual, ComparisonOperator.Like, ComparisonOperator.Unlike]" />
                </DropdownMenuLabel>
                <DropdownMenuLabel class="flex gap-2">
                    <CommonInputWithControls
                        v-model:from="dateFrom"
                        v-model:to="dateTo"
                        v-model:operator="dateOp"
                        type="date"
                        label="Filter by Upload Date"
                        placeholder="Filter by upload date..."
                        :options="[
                            ComparisonOperator.Disabled,
                            ComparisonOperator.Equal,
                            ComparisonOperator.NotEqual,
                            ComparisonOperator.GreaterOrEqual,
                            ComparisonOperator.LessOrEqual,
                            ComparisonOperator.Greater,
                            ComparisonOperator.Less,
                            ComparisonOperator.Between,
                        ]" />
                </DropdownMenuLabel>
            </DropdownMenuContent>
        </DropdownMenu>

        <CommonInputWithControls
            v-model:from="nameFrom"
            v-model:operator="nameOp"
            type="string"
            :hide-label="true"
            :hard-corners="true"
            placeholder="Filter by name..."
            class="lg:min-w-[202px] w-full rounded-r-none rounded-l-none z-10"
            :options="[ComparisonOperator.Disabled, ComparisonOperator.Equal, ComparisonOperator.NotEqual, ComparisonOperator.Like, ComparisonOperator.Unlike]" />

        <Button id="save" type="submit" variant="outline" class="border-l-0 rounded-l-none" @click="onSubmit">
            <span class="sr-only">Filter</span>
            <SendHorizonal class="h-[1.2rem] w-[1.2rem]" />
        </Button>
    </div>
</template>

<style scoped></style>
