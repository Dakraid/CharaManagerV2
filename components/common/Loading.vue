<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

defineProps<{
    loadingText?: string;
    cssClass?: string;
    showText?: boolean;
}>();
</script>

<template>
    <div :class="cn('w-full h-full flex flex-1 flex-col gap-8 items-center justify-center backdrop-blur-lg bg-background/50 z-20', cssClass)">
        <LoaderCircle class="h-20 w-20 mx-auto motion-safe:animate-spin" />
        <h1 v-if="loadingText !== undefined && loadingText.trim() !== ''" class="text-4xl font-bold motion-safe:animate-pulse">{{ loadingText ?? 'Loading...' }}</h1>
    </div>
</template>

<style scoped></style>
