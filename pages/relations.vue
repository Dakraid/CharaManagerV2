<script setup lang="ts">
import { vElementVisibility } from '@vueuse/components';
import _ from 'lodash';

const router = useRouter();
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
    await router.push({
        path: 'compare',
        query: { parent: parent.id, child: child.id },
    });
}
</script>

<template>
    <Transition>
        <CommonLoading v-if="loading" loading-text="Loading relations" />
        <ScrollArea
            v-else-if="!loading && parentCharacters.length > 0"
            v-element-visibility="onElementVisibility"
            class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-hidden scroll-smooth">
            <div class="w-full flex flex-col wrap gap-4 m-4">
                <div v-for="parentCharacter in parentCharacters" :key="parentCharacter.id" class="Container w-full">
                    <LazyCharsDisplayDefault :character="parentCharacter" class="Parent" />
                    <Separator orientation="vertical" class="SeparatorY h-full my-auto" />
                    <Transition>
                        <div v-if="childCharacters[parentCharacter.id] && childCharacters[parentCharacter.id].length > 0" class="Child flex flex-wrap gap-2">
                            <LazyCharsDisplayChild
                                v-for="childCharacter in childCharacters[parentCharacter.id]"
                                :key="childCharacter.id"
                                :character="childCharacter"
                                @compare="showCompare(parentCharacter, childCharacter)" />
                        </div>
                        <CommonLoading v-else class="Child" />
                    </Transition>
                    <Separator orientation="horizontal" class="SeparatorX w-full mt-1" />
                </div>
            </div>
        </ScrollArea>
        <CommonError v-else error="No relations found" />
    </Transition>
</template>

<style scoped>
.Container {
    display: grid;
    grid-template-columns: 320px 3px 1fr;
    grid-template-rows: 1fr 3px;
    gap: 0.5rem;
    grid-template-areas:
        'Parent SeparatorY Child'
        'SeparatorX SeparatorX SeparatorX';
}

.SeparatorY {
    grid-area: SeparatorY;
}

.Parent {
    grid-area: Parent;
}

.Child {
    grid-area: Child;
}

.SeparatorX {
    grid-area: SeparatorX;
}
</style>
