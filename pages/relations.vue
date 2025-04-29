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
        .addTags([`relations:${characterStore.characterHighest}`]);
});

const hasError = ref<boolean>(false);

characterStore.isFetching = true;

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

characterStore.isFetching = false;

async function showCompare(parent: Character, child: Character) {
    await router.push({
        path: 'compare',
        query: { parent: parent.id, child: child.id },
    });
}
</script>

<template>
    <Transition>
        <ScrollArea v-if="parentCharacters.length > 0" class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-scroll">
            <div class="m-4 flex w-full flex-col gap-4 wrap">
                <div v-for="parentCharacter in parentCharacters" :key="parentCharacter.id" class="Container w-full items-center justify-center">
                    <LazyCharsDisplayDefault :character="parentCharacter" class="Parent w-full" />
                    <Separator orientation="vertical" class="my-auto h-full SeparatorY" />
                    <Transition>
                        <div v-if="childCharacters[parentCharacter.id] && childCharacters[parentCharacter.id].length > 0" class="flex flex-wrap gap-2 Child">
                            <LazyCharsDisplayChild
                                v-for="childCharacter in childCharacters[parentCharacter.id]"
                                :key="childCharacter.id"
                                :character="childCharacter"
                                @compare="showCompare(parentCharacter, childCharacter)" />
                        </div>
                        <CommonLoading v-else class="rounded-xl Child" />
                    </Transition>
                    <Separator orientation="horizontal" class="mt-1 w-full SeparatorX" />
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
