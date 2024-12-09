<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';
import { getCharacterDefinitionById } from '~/composables/getCharacterDefinitionById';

const props = defineProps<{
    character: Character | undefined;
    parent: Character | undefined;
}>();

defineEmits(['close']);

function formatJSON(val: any) {
    const res = JSON.parse(val);
    return JSON.stringify(res, null, 2);
}

const parentChar = ref<string>('');
const childChar = ref<string>('');

if (props.parent && props.character) {
    parentChar.value = formatJSON((await getCharacterDefinitionById(props.parent.id)) ?? '');
    childChar.value = formatJSON((await getCharacterDefinitionById(props.character.id)) ?? '');
}
</script>

<template>
    <div class="Container w-full h-full">
        <Button variant="destructive" size="icon" class="Button w-full h-full z-10" @click="$emit('close')">
            <CircleX class="w-4 h-4" />
        </Button>
        <div class="Editor flex flex-col gap-2 w-full h-full px-2 rounded-md border border-muted">
            <div class="flex justify-around w-full py-4">
                <h1 class="font-bold text-2xl">Child ({{ character.charName }} - #{{ character.id }})</h1>
                <h1 class="font-bold text-2xl">Parent ({{ parent.charName }} - #{{ parent.id }})</h1>
            </div>
            <MonacoDiffEditor v-model="childChar" :original="parentChar" lang="json" class="w-full h-full" :options="{ theme: 'vs-dark', autoIndent: 'full' }" />
        </div>
    </div>
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
