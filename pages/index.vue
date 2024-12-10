<script setup lang="ts">
import { vElementVisibility } from '@vueuse/components';

const route = useRoute();
const router = useRouter();
const nuxtApp = useNuxtApp();
const appStore = useAppStore();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value.user) {
            return navigateTo('/authenticate');
        }
    },
});

characterStore.currentPage = Number(route.query.page) ? Number(route.query.page) : 1;

router.push({
    path: '',
    query: { page: characterStore.currentPage },
});

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`characters:${characterStore.highestId}-${appStore.perPage}-${characterStore.count}`]);
});

characterStore.loading = true;
await nuxtApp.hooks.callHook('characters:refresh');

async function updatePage(page: number) {
    characterStore.currentPage = page;

    await router.push({
        path: '',
        query: { page: characterStore.currentPage },
    });

    await nuxtApp.hooks.callHook('characters:refresh');
}

async function updatePerPage(perPage: number) {
    appStore.perPage = perPage;
    await nuxtApp.hooks.callHook('characters:refresh');
}

async function onElementVisibility(state: boolean) {
    characterStore.loading = !state;
}
</script>

<template>
    <div class="flex-1 grid grid-cols-[1fr] grid-rows-[min-content_1fr] xl:grid-cols-[1fr_400px] gap-2 max-h-[calc(100vh_-_theme(spacing.16))]">
        <div class="pagination-grid justify-center items-center gap-2 lg:gap-8 my-1">
            <div class="total flex justify-center h-10 w-40 md:w-48 rounded-md border border-input bg-background ring-offset-background p-2">
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
                    <PaginationList v-slot="{ items }" class="flex items-center justify-between md:justify-center gap-1">
                        <PaginationFirst />
                        <PaginationPrev />

                        <template v-for="(item, index) in items">
                            <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                                <Button class="w-10 h-10 p-0" :variant="item.value === characterStore.currentPage ? 'default' : 'outline'">
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

            <div class="perPage flex gap-2 w-40 md:w-48">
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
                            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-10 h-10 p-0">
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
        <Transition>
            <CommonLoading v-if="!characterStore.characters || characterStore.loading" loading-text="Loading..." css-class="col-start-1 row-start-2" />
        </Transition>
        <Transition>
            <h1
                v-if="!characterStore.loading && characterStore.characters && characterStore.characters.length === 0"
                class="col-start-1 row-start-2 text-2xl text-center font-bold">
                No characters found!
            </h1>
            <ScrollArea
                v-else
                v-element-visibility="onElementVisibility"
                class="max-h-[calc(100vh_-_12.5rem)] rounded-md overflow-y-hidden scroll-smooth"
                style="grid-column-start: 1; grid-row-start: 2">
                <ClientOnly>
                    <RenderCacheable v-if="appStore.cardSize == 2" class="flex justify-around flex-wrap gap-2 m-4">
                        <LazyCharsDisplaySquare v-for="character in characterStore.characters" :key="character.id" :character="character" />
                    </RenderCacheable>
                    <RenderCacheable v-else class="flex justify-around flex-wrap gap-2 m-4">
                        <LazyCharsDisplayDefault v-for="character in characterStore.characters" :key="character.id" :character="character" />
                    </RenderCacheable>
                </ClientOnly>
            </ScrollArea>
        </Transition>
        <RenderCacheable class="hidden row-start-1 row-span-2 lg:col-start-2 lg:block lg:max-h-[calc(100vh_-_theme(spacing.36))]">
            <CharsSidebar />
        </RenderCacheable>
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
