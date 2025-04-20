<script setup lang="ts">
import { FileQuestion } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
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

appStore.currentPage = Number(route.query.page) ? Number(route.query.page) : 1;

router.push({
    path: '',
    query: { page: appStore.currentPage },
});

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`characters:page-${characterStore.characterHighest}-${appStore.currentPage}-${appStore.perPage}`]);
});

onMounted(async () => {
    await characterStore.refreshCharacters();
    await characterStore.updateLoadingState(false);
});
</script>

<template>
    <div class="grid grid-cols-[1fr] grid-rows-[min-content_1fr] max-h-[calc(100vh_-_theme(spacing.16))]">
        <Transition name="fade" mode="out-in">
            <Skeleton v-if="characterStore.characterCount === -1" class="w-[calc(100% - 1rem)] h-10 m-4 rounded-md" />
            <CharsPagination v-else />
        </Transition>
        <Transition name="fade" mode="out-in">
            <div
                v-if="!(characterStore.appLoading || characterStore.isFetching) && characterStore.characterList && characterStore.characterList.length === 0"
                class="col-start-1 row-start-2 h-[calc(100vh_-_8.5rem)] flex flex-col justify-center items-center gap-4">
                <FileQuestion class="h-24 w-24 animate-bounce" />
                <h1 class="text-center text-2xl font-bold">No characters found!</h1>
                <div class="flex flex-col items-center justify-center">
                    <h2 class="text-center text-xl">Upload or create one using the edit bar!</h2>
                    <h2 class="text-center text-xl">Just click the pen in the top right corner!</h2>
                </div>
            </div>
            <ScrollArea v-else class="max-h-[calc(100vh_-_8.5rem)] rounded-md overflow-y-hidden scroll-smooth" style="grid-column-start: 1; grid-row-start: 2">
                <ClientOnly>
                    <RenderCacheable v-if="appStore.cardSize == 3" class="m-4 flex flex-wrap justify-around gap-4">
                        <LazyCharsDisplayCanvas v-for="character in characterStore.characterList" :key="character.id" :character="character" />
                    </RenderCacheable>
                    <RenderCacheable v-else-if="appStore.cardSize == 2" class="m-4 flex flex-wrap justify-around gap-0">
                        <LazyCharsDisplayParallax v-for="character in characterStore.characterList" :key="character.id" :character="character" />
                    </RenderCacheable>
                    <RenderCacheable v-else-if="appStore.cardSize == 1" class="m-4 flex flex-wrap justify-around gap-4">
                        <LazyCharsDisplaySquare v-for="character in characterStore.characterList" :key="character.id" :character="character" />
                    </RenderCacheable>
                    <RenderCacheable v-else class="my-2 mx-4 flex flex-wrap justify-around gap-3">
                        <LazyCharsDisplayDefault v-for="character in characterStore.characterList" :key="character.id" :character="character" />
                    </RenderCacheable>
                </ClientOnly>
            </ScrollArea>
        </Transition>
    </div>
</template>

<style scoped></style>
