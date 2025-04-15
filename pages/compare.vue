<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';
import { formatJSON } from '~/composables/formatJson';

const route = useRoute();
const router = useRouter();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value.user) {
            return navigateTo('/authenticate');
        }
    },
});

const parentId = ref<number>(Number(route.query.parent));
const childId = ref<number>(Number(route.query.child));

const parentCharRef = ref<Character>();
const childCharRef = ref<Character>();
const parentCharJson = ref<string>();
const childCharJson = ref<string>();

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`compare:${parentId.value}-${childId.value}`]);
});

characterStore.loading = true;

const parent = await $fetch<CharacterWithDef>('/api/chars/character', {
    method: 'GET',
    query: { id: parentId.value },
});

const child = await $fetch<CharacterWithDef>('/api/chars/character', {
    method: 'GET',
    query: { id: childId.value },
});

try {
    parentCharRef.value = parent;
    childCharRef.value = child;
    parentCharJson.value = await formatJSON(parent.definition ?? '');
    childCharJson.value = await formatJSON(child.definition ?? '');
} catch (err: any) {
    console.error(err);
}

characterStore.loading = false;

async function closeCompare() {
    router.back();
}
</script>

<template>
    <Transition>
        <div v-if="characterStore.loading && !parent && !child" class="Container h-full w-full">
            <CommonLoading class="h-full w-full rounded-xl Editor" loading-text="Loading characters..." />
        </div>
        <div v-else-if="!characterStore.loading && !parent && !child" class="Container h-full w-full">
            <CommonError class="h-full w-full Editor" error="Failed to retrieve characters." />
        </div>
        <div v-else class="Container h-full w-full">
            <Button variant="destructive" size="icon" class="z-10 h-full w-full Button" @click="closeCompare">
                <CircleX class="h-4 w-4" />
            </Button>
            <div class="flex h-full w-full flex-col gap-2 rounded-md border px-2 Editor border-muted">
                <div class="flex w-full justify-around py-4">
                    <h1 class="text-2xl font-bold">Child ({{ childCharRef!.charName }} - #{{ childId }})</h1>
                    <h1 class="text-2xl font-bold">Parent ({{ parentCharRef!.charName }} - #{{ parentId }})</h1>
                </div>
                <MonacoDiffEditor
                    v-model="childCharJson"
                    :original="parentCharJson"
                    lang="json"
                    class="h-full w-full"
                    :options="{
                        theme: 'vs-dark',
                        autoIndent: 'full',
                        wordWrap: 'on',
                        smoothScrolling: true,
                        experimental: {
                            showMoves: true,
                        },
                    }" />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.Container {
    display: grid;
    grid-template-columns: 1fr 2.5rem 0.5rem;
    grid-template-rows: 0.5rem 2.5rem 1fr;
    gap: 0;
}

.Button {
    grid-area: 2 / 2 / 3 / 3;
}

.Editor {
    grid-area: 1 / 1 / 4 / 4;
}
</style>
