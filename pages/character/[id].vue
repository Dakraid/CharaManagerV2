<script setup lang="ts">
import * as Cards from 'character-card-utils';

const route = useRoute();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value.user) {
            return navigateTo('/authenticate');
        }
    },
});

characterStore.loading = true;

const activeCharacter = ref<CharacterWithDef>();
const activeDefinition = ref<Cards.V2>();

onMounted(async () => {
    if (validateIdRouteParameter(route) && activeCharacter.value === undefined) {
        const character = await $fetch<CharacterWithDef>('/api/chars/character', {
            method: 'GET',
            query: { id: route.params.id },
        });

        if (character) {
            activeCharacter.value = character;

            let json;
            if (activeCharacter.value.definition.includes('\\"spec\\"')) {
                json = JSON.parse(JSON.parse(activeCharacter.value.definition));
            } else {
                json = JSON.parse(activeCharacter.value.definition);
            }

            activeDefinition.value = Cards.parseToV2(json);
        }
    }

    characterStore.loading = false;
});
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-if="characterStore.loading && activeCharacter === undefined" />
        <CommonError v-else-if="!characterStore.loading && activeCharacter === undefined" error="Character not found" class="rounded-xl" />
        <div v-else class="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 lg:flex-nowrap">
            <CharsDetailsImage :character="activeCharacter!" />
            <CharsDetailsEditor v-model:character="activeCharacter!" v-model:definition="activeDefinition!" />
        </div>
    </Transition>
</template>

<style scoped></style>
