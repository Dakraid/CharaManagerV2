<script setup lang="ts">
import {vElementVisibility} from '@vueuse/components';
import _ from 'lodash';

const appStore = useAppStore();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const {loggedIn} = useUserSession();
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
    const {data} = await useFetch<Relation[]>('/api/relations/retrieve', {
        method: 'POST',
    });
    relations = data.value ?? [];
} catch (err: any) {
    console.error(err);
    hasError.value = true;
}

const groupedRelations = _.groupBy(relations, 'parentId');

const parentCharacters: Character[] = [];
const childCharacters: { [parentId: number]: Character[] } = {};
try {
    const {data} = await useFetch<Character[]>('/api/chars/characters', {
        method: 'POST',
        body: {
            ids: Object.keys(groupedRelations),
        },
    });

    if (data.value !== null) {
        parentCharacters.push(...data.value);
    }

    _.forEach(groupedRelations, async function (value, key) {
        const childIds = value.map((x) => x.childId);
        const {data} = await useFetch<Character[]>('/api/chars/characters', {
            method: 'POST',
            body: {
                ids: childIds,
            },
        });

        if (!childCharacters[Number(key)]) {
            childCharacters[Number(key)] = [];
        }

        if (data.value !== null) {
            childCharacters[Number(key)].push(...data.value);
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
        <ScrollArea v-if="!compare" v-element-visibility="onElementVisibility" class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-hidden scroll-smooth">
            <div class="w-full flex flex-col wrap gap-4 m-4">
                <div v-for="parentCharacter in parentCharacters" :key="parentCharacter.id" class="w-full flex flex-row flex-wrap gap-2">
                    <CharsDisplayDefault :character="parentCharacter"/>
                    <Separator orientation="vertical" class="h-[596px] my-auto"/>
                    <CharsDisplayChild
                        v-for="childCharacter in childCharacters[parentCharacter.id]"
                        :key="childCharacter.id"
                        :character="childCharacter"
                        @compare="showCompare(parentCharacter, childCharacter)"/>
                    <Separator orientation="horizontal" class="mt-2"/>
                </div>
            </div>
        </ScrollArea>
        <CharsCompare v-else :character="childChar" :parent="parentChar" @close="closeCompare"/>
    </Transition>
</template>

<style scoped></style>
