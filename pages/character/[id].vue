<script setup lang="ts">
import { Undo2 } from 'lucide-vue-next';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value?.user) {
            return navigateTo('/authenticate');
        }
    },
});

characterStore.isFetching = true;
characterStore.loadedCharacter = undefined;

const inlineSrc = ref();

onMounted(async () => {
    if (validateIdRouteParameter(route) && (characterStore.loadedCharacter === undefined || characterStore.loadedCharacter.character.id !== Number(route.params.id))) {
        await characterStore.fetchCharacterWithDef(Number(route.params.id));

        inlineSrc.value = runtimeConfig.public.imageDomain.endsWith('/')
            ? `${runtimeConfig.public.imageDomain}full/${characterStore.loadedCharacter!.character.id}.png`
            : `${runtimeConfig.public.imageDomain}/full/${characterStore.loadedCharacter!.character.id}.png`;
    }

    if (!characterStore.loadedCharacter) {
        showError('No character loaded');
    }
});
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-if="characterStore.isFetching && characterStore.loadedCharacter === undefined" />
        <CommonError v-else-if="!characterStore.isFetching && characterStore.loadedCharacter === undefined" error="Character not found" class="rounded-xl" />
        <div v-else class="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 lg:flex-nowrap">
            <div class="flex flex-col w-full h-full items-center justify-center gap-2 overflow-y-auto flex-nowrap lg:max-w-[434px]">
                <Button id="clear" type="submit" variant="outline" class="w-full" @click="$router.back()">
                    <span class="sr-only">Back</span>
                    <Undo2 class="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <CharsDetailsImage />
            </div>
            <CharsDetailsEditor />
        </div>
    </Transition>
</template>

<style></style>
