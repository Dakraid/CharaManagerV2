<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next';
import type { FetchError } from 'ofetch';

const props = defineProps<{
    error: FetchError<any> | string | null;
}>();

const formattedError = ref<string>('');
const hint = ref<string>('');

if (typeof props.error === 'string') {
    formattedError.value = props.error;
} else {
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
}
</script>

<template>
    <div class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2">
        <TriangleAlert class="mx-auto h-20 w-20 motion-safe:animate-bounce" />
        <div class="flex flex-col items-center justify-center gap-2">
            <h1 class="text-2xl font-bold">An error occurred:</h1>
            <h2 class="text-2xl">{{ formattedError }}</h2>
            <h2 v-if="hint.trim() !== ''" class="text-xl text-muted-foreground">{{ hint }}</h2>
        </div>
    </div>
</template>

<style scoped></style>
