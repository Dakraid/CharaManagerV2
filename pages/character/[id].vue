<script setup lang="ts">
import * as Cards from 'character-card-utils';

const route = useRoute();
const nuxtApp = useNuxtApp();
const characterStore = useCharacterStore();

await nuxtApp.hooks.callHook('characters:refresh');
await characterStore.setActiveCharacter(Number(route.params.id));

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .addTags([`character:${route.params.id}`]);
});

if (!characterStore.activeCharacter) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Character not found',
    });
}

const activeCharacter = ref<Character>(characterStore.activeCharacter);
const activeDefinition = ref<Cards.V2>();

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
            <CommonLoading v-if="status !== 'success'" loading-text="Processing..." />
            <CharsDetails v-else-if="activeDefinition" :character="activeCharacter" :definition="activeDefinition" />
        </Transition>
    </div>
</template>

<style scoped></style>
