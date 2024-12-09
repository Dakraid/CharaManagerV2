<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next';
import type { FetchError } from 'ofetch';

const props = defineProps<{
    error: FetchError<any> | null;
}>();

const formattedError = ref<string>('');
const hint = ref<string>('');

if (props.error?.message.includes(':')) {
    const message = props.error.message.split(':')[1].trim();
    const code = props.error.statusCode;
    if (code) {
        formattedError.value = message.replace(/(\d{3})/g, `[$1 : ${StatusCode[code]}] `);
    } else {
        formattedError.value = message.replace(/(\d{3})/g, `[$1] `);
    }

    if (message.includes('API key provided')) {
        hint.value = 'You can set your API key by clicking on the user settings in the top right corner.';
    }
}
</script>

<template>
    <div class="w-full h-full flex flex-1 flex-col gap-2 items-center justify-center">
        <TriangleAlert class="h-20 w-20 mx-auto motion-safe:animate-bounce" />
        <div class="flex flex-col gap-2 items-center justify-center">
            <h1 class="text-2xl font-bold">An error occurred:</h1>
            <h2 class="text-2xl">{{ formattedError }}</h2>
            <h2 v-if="hint.trim() !== ''" class="text-xl text-muted-foreground">{{ hint }}</h2>
        </div>
    </div>
</template>

<style scoped></style>
