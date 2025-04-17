<script setup lang="ts">
const router = useRouter();
const appStore = useAppStore();
const characterStore = useCharacterStore();

async function updatePage(page: number) {
    characterStore.currentPage = page;

    await router.push({
        path: '',
        query: { page: characterStore.currentPage },
    });

    await characterStore.refreshCharacters();
}

async function updatePerPage(perPage: number) {
    appStore.perPage = perPage;
    await characterStore.refreshCharacters();
}
</script>

<template>
    <div class="items-center justify-center gap-2 px-2 pagination-grid lg:gap-8">
        <div class="flex h-10 w-40 justify-center rounded-md border p-2 total border-input bg-background ring-offset-background md:w-48">
            <h1 class="text-center text-sm">Total Items: {{ characterStore.count }}</h1>
        </div>

        <ClientOnly>
            <Pagination
                :page="characterStore.currentPage"
                :total="characterStore.count - appStore.perPage"
                :items-per-page="appStore.perPage"
                :sibling-count="1"
                show-edges
                class="controls"
                @update:page="updatePage">
                <PaginationList v-slot="{ items }" class="flex items-center justify-between gap-1 md:justify-center">
                    <PaginationFirst />
                    <PaginationPrev />

                    <template v-for="(item, index) in items">
                        <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                            <Button class="h-10 w-10 p-0" :variant="item.value === characterStore.currentPage ? 'default' : 'outline'">
                                {{ item.value }}
                            </Button>
                        </PaginationListItem>
                        <PaginationEllipsis v-else :key="item.type" :index="index" />
                    </template>

                    <PaginationNext />
                    <PaginationLast />
                </PaginationList>
            </Pagination>
        </ClientOnly>

        <div class="flex w-40 gap-2 perPage md:w-48">
            <NumberField id="perPage" :default-value="30" :min="1" :model-value="appStore.perPage" @update:model-value="updatePerPage">
                <NumberFieldContent>
                    <NumberFieldDecrement class="p-2" />
                    <NumberFieldInput class="p-2" />
                    <NumberFieldIncrement class="p-2" />
                </NumberFieldContent>
            </NumberField>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger
                        class="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md border p-0 text-sm font-medium transition-colors ring-offset-background border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        ?
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <div class="flex flex-col gap-2">
                            <h1>Set how many items are displayed per page</h1>
                            <h1>It's not recommended to go beyond 90 items per page</h1>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
</template>

<style scoped>
.pagination-grid {
    display: grid;
    grid-auto-columns: 1fr;
    grid-template-columns: 10rem 1fr 10rem;
    grid-template-rows: 2.5rem 2.5rem;
    gap: 1rem 0;
    grid-template-areas:
        'total . perPage'
        'controls controls controls';

    @media (min-width: 768px) {
        grid-auto-columns: 1fr;
        grid-template-columns: 12rem max-content 12rem;
        grid-template-rows: 2.5rem;
        gap: 1rem;
        grid-template-areas: 'total controls perPage';
    }
}

.total {
    grid-area: total;
}

.perPage {
    grid-area: perPage;
}

.controls {
    grid-area: controls;
}
</style>
