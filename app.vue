<script setup lang="ts">
import '~/assets/css/site.css';
import { toast } from '~/components/ui/toast';

const nuxtApp = useNuxtApp();
const appStore = useAppStore();
const characterStore = useCharacterStore();

async function refreshCharacter() {
    characterStore.loading = true;

    try {
        const { data } = await useFetch<number>('/api/chars/count', {
            method: 'GET',
        });
        characterStore.count = data.value ?? 0;
    } catch (err: any) {
        console.error(err);
    }

    try {
        const { data } = await useFetch<Character[]>('/api/chars/characters', {
            method: 'GET',
            query: {
                page: characterStore.currentPage,
                perPage: appStore.perPage,
            },
        });

        characterStore.characters = data.value ?? undefined;
    } catch (err: any) {
        console.error(err);
    }

    characterStore.loading = false;
}

nuxtApp.hooks.hook('characters:refresh', async () => {
    await refreshCharacter();
});

nuxtApp.hooks.hook('characters:menu', async (id: number) => {
    characterStore.activeCharacter = characterStore.characters?.find((c) => c.id === id);
    if (!characterStore.activeCharacter) {
        toast({
            title: 'No character found!',
            description: 'The requested ID was not found in the character array.',
            variant: 'destructive',
        });

        return;
    }
    await navigateTo({
        path: `/character/${id}`,
    });
});
</script>

<template>
    <NuxtPwaManifest />
    <div class="flex h-screen min-h-screen max-h-screen min-w-screen max-w-screen flex-col">
        <NavHeader />
        <main
            class="flex flex-1 flex-col h-[calc(100vh_-_theme(spacing.16))] min-h-[calc(100vh_-_theme(spacing.16))] max-h-[calc(100vh_-_theme(spacing.16))] bg-muted/40 p-4 gap-4 md:gap-8 md:p-10">
            <NuxtPage />
        </main>
        <Toaster />
    </div>
</template>

<style></style>
