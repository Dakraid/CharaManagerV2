<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';
import { formatJSON } from '~/composables/formatJson';

const route = useRoute();
const router = useRouter();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value.user) {
            return navigateTo('/authenticate');
        }
    },
});

const error = ref<boolean>(false);
const loading = ref<boolean>(true);
const parentId = ref<number>(Number(route.query.parent));
const childId = ref<number>(Number(route.query.child));

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`compare:${parentId.value}-${childId.value}`]);
});

const [parentChar, childChar, parentCharDef, childCharDef] = await Promise.all([
    getCharacterById(parentId.value),
    getCharacterById(childId.value),
    getCharacterDefinitionById(parentId.value),
    getCharacterDefinitionById(childId.value),
]);

const parentCharRef = ref<Character>();
const childCharRef = ref<Character>();
const parentCharJson = ref<string>();
const childCharJson = ref<string>();

if (parentChar && childChar) {
    parentCharRef.value = parentChar;
    childCharRef.value = childChar;
    parentCharJson.value = await formatJSON(parentCharDef ?? '');
    childCharJson.value = await formatJSON(childCharDef ?? '');
} else {
    error.value = true;
}

loading.value = false;

async function closeCompare() {
    router.back();
}
</script>

<template>
    <Transition>
        <div v-if="loading" class="Container h-full w-full">
            <CommonLoading class="h-full w-full rounded-xl Editor" loading-text="Loading characters..." />
        </div>
        <div v-else-if="!loading && parentChar && childChar" class="Container h-full w-full">
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
        <div v-else class="Container h-full w-full">
            <CommonError class="h-full w-full Editor" error="Failed to retrieve characters." />
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
