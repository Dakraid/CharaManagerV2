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
        <div v-if="loading" class="Container w-full h-full">
            <CommonLoading class="Editor w-full h-full" loading-text="Loading characters..." />
        </div>
        <div v-else-if="!loading && parentChar && childChar" class="Container w-full h-full">
            <Button variant="destructive" size="icon" class="Button w-full h-full z-10" @click="closeCompare">
                <CircleX class="w-4 h-4" />
            </Button>
            <div class="Editor flex flex-col gap-2 w-full h-full px-2 rounded-md border border-muted">
                <div class="flex justify-around w-full py-4">
                    <h1 class="font-bold text-2xl">Child ({{ childCharRef!.charName }} - #{{ childId }})</h1>
                    <h1 class="font-bold text-2xl">Parent ({{ parentCharRef!.charName }} - #{{ parentId }})</h1>
                </div>
                <MonacoDiffEditor
                    v-model="childCharJson"
                    :original="parentCharJson"
                    lang="json"
                    class="w-full h-full"
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
        <div v-else class="Container w-full h-full">
            <CommonError class="Editor w-full h-full" error="Failed to retrieve characters." />
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
