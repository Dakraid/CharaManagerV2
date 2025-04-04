<script setup lang="ts">
import '~/assets/css/site.css';

const nuxtApp = useNuxtApp();
const appStore = useAppStore();
const characterStore = useCharacterStore();

async function refreshCharacters() {
    characterStore.loading = true;

    try {
        characterStore.count = await $fetch<number>('/api/chars/count', {
            method: 'GET',
        });
    } catch (err: any) {
        console.warn('Failed to fetch the character count: %s', err);
    }

    try {
        characterStore.characters = await $fetch<Character[]>('/api/chars/characters', {
            method: 'GET',
            query: {
                page: characterStore.currentPage,
                perPage: appStore.perPage,
            },
        });
    } catch (err: any) {
        console.warn('Failed to fetch the characters: %s', err);
    }

    characterStore.loading = false;
}

nuxtApp.hooks.hook('characters:refresh', async () => {
    await refreshCharacters();
});

nuxtApp.hooks.hook('characters:menu', async (id: number) => {
    await navigateTo({
        path: `/character/${id}`,
    });
});
</script>

<template>
    <NuxtPwaManifest />
    <Toaster />
    <div class="PageContainer h-screen min-h-screen max-h-screen min-w-screen max-w-screen">
        <Transition>
            <CommonLoading v-if="characterStore.loading" loading-text="Loading..." class="Overlay" />
        </Transition>
        <NavHeader class="Header" />
        <main
            class="Content flex flex-1 flex-col h-[calc(100vh_-_theme(spacing.16))] min-h-[calc(100vh_-_theme(spacing.16))] max-h-[calc(100vh_-_theme(spacing.16))] bg-muted/40 p-4 gap-4 md:gap-8 md:p-10">
            <NuxtPage />
        </main>
    </div>
</template>

<style scoped>
.PageContainer {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    gap: 0;
    grid-auto-flow: row;
}

.Header {
    grid-area: 1 / 1 / 2 / 2;
}

.Content {
    grid-area: 2 / 1 / 3 / 2;
}

.Overlay {
    grid-area: 1 / 1 / 3 / 2;
}
</style>
