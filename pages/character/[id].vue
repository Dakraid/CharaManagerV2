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

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .addTags([`character:${route.params.id}`]);
});

const activeCharacter = ref<Character>();
const activeDefinition = ref<Cards.V2>();

activeCharacter.value = characterStore.characters?.find((c) => c.id === Number(route.params.id));
if (activeCharacter.value === undefined) {
    const { data } = await useFetch<Character>('/api/chars/character', {
        method: 'POST',
        body: { id: route.params.id },
    });

    if (data.value) {
        activeCharacter.value = data.value;
    }
}

if (activeCharacter.value === undefined) {
    showError({
        statusCode: 404,
        statusMessage: 'Character not found',
    });
}

const { data, status } = useFetch<DefinitionRow[]>('/api/defs/definition', {
    method: 'GET',
    query: {
        id: route.params.id,
    },
});

while (status.value !== 'success') {
    await Sleep(100);
}

if (data.value && data.value[0]) {
    let json;
    if (data.value[0].definition.includes('\\"spec\\"')) {
        json = JSON.parse(JSON.parse(data.value[0].definition));
    } else {
        json = JSON.parse(data.value[0].definition);
    }
    activeDefinition.value = Cards.parseToV2(json);
}
</script>

<template>
    <div class="flex-1 max-h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
        <Transition>
            <CommonLoading v-if="status !== 'success'" loading-text="Processing..." class="rounded-xl" />
            <CharsDetails v-else-if="activeDefinition" :character="activeCharacter!" :definition="activeDefinition" />
        </Transition>
    </div>
</template>

<style scoped></style>
