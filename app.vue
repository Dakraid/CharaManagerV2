<script setup lang="ts">
import '~/assets/css/site.css';

const nuxtApp = useNuxtApp();
const characterStore = useCharacterStore();

nuxtApp.hooks.hook('characters:menu', async (id: number) => {
    characterStore.activeCharacter = id;
    characterStore.loading = true;
    await navigateTo({
        path: `/character/${id}`,
    });
});
</script>

<template>
    <NuxtPwaManifest />
    <Toaster />
    <div class="h-screen max-h-screen min-h-screen PageContainer min-w-screen max-w-screen">
        <Transition>
            <CommonLoading v-if="characterStore.loading" loading-text="Loading..." class="Overlay" />
        </Transition>
        <NavHeader class="Header" />
        <main class="Content h-[calc(100vh_-_theme(spacing.16))] min-h-[calc(100vh_-_theme(spacing.16))] max-h-[calc(100vh_-_theme(spacing.16))] max-w-screen bg-muted/40 p-4 px-0">
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
