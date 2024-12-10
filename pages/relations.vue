<script setup lang="ts">
import { vElementVisibility } from '@vueuse/components';
import _ from 'lodash';

const appStore = useAppStore();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) {
            return navigateTo('/authenticate');
        }
    },
});

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`relations:${characterStore.highestId}`]);
});

const hasError = ref<boolean>(false);
const loading = ref<boolean>(true);
const compare = ref<boolean>(false);
const parentChar = ref<Character | undefined>();
const childChar = ref<Character | undefined>();

let relations: Relation[] = [];
try {
    const { data } = await useFetch<Relation[]>('/api/relations/retrieve', {
        method: 'POST',
    });
    relations = data.value ?? [];
} catch (err: any) {
    console.error(err);
    hasError.value = true;
}

const groupedRelations = _.groupBy(relations, 'parentId');

const parentCharacters = ref<Character[]>([]);
const childCharacters = ref<{ [id: number]: Character[] }>({});

try {
    const characters = await $fetch<Character[]>('/api/chars/characters', {
        method: 'POST',
        body: {
            ids: Object.keys(groupedRelations),
        },
    });

    if (characters) {
        parentCharacters.value.push(...characters);
    }

    _.forEach(groupedRelations, async function (value, key) {
        const childIds = value.map((x) => x.childId);
        const characters1 = await $fetch<Character[]>('/api/chars/characters', {
            method: 'POST',
            body: {
                ids: childIds,
            },
        });

        if (characters1 !== null && characters1.length > 0) {
            const numKey = Number(key);
            childCharacters.value[numKey] = characters1;
        }
    });
} catch (err: any) {
    console.error(err);
    hasError.value = true;
}

loading.value = hasError.value;

async function onElementVisibility(state: boolean) {
    characterStore.loading = !state;
}

async function showCompare(parent: Character, child: Character) {
    compare.value = true;
    parentChar.value = parent;
    childChar.value = child;
}

async function closeCompare() {
    compare.value = false;
    parentChar.value = undefined;
    childChar.value = undefined;
}
</script>

<template>
    <Transition>
        <CommonLoading v-if="loading" loading-text="Loading relations" />
        <CharsCompare v-else-if="!loading && compare" :character="childChar" :parent="parentChar" @close="closeCompare" />
        <ScrollArea
            v-else-if="!loading && parentCharacters.length > 0"
            v-element-visibility="onElementVisibility"
            class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-hidden scroll-smooth">
            <div class="w-full flex flex-col wrap gap-4 m-4">
                <div v-for="parentCharacter in parentCharacters" :key="parentCharacter.id" class="w-full flex flex-row flex-wrap gap-2">
                    <LazyCharsDisplayDefault :character="parentCharacter" />
                    <Separator orientation="vertical" class="h-[596px] my-auto" />
                    <LazyCharsDisplayChild
                        v-for="childCharacter in childCharacters[parentCharacter.id]"
                        :key="childCharacter.id"
                        :character="childCharacter"
                        @compare="showCompare(parentCharacter, childCharacter)" />
                    <Separator orientation="horizontal" class="mt-2" />
                </div>
            </div>
        </ScrollArea>
        <CommonError v-else error="No relations found" />
    </Transition>
</template>

<style scoped></style>
