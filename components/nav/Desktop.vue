<script setup lang="ts">
import { cn } from '~/lib/utils';
</script>

<template>
    <nav class="hidden flex-col gap-4 text-lg font-medium lg:flex lg:flex-row lg:items-center lg:text-sm">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold md:mr-4 md:text-base">
            <NuxtImg src="/logo.svg" alt="Logo" class="h-10 w-10 min-h-10 min-w-10" />
            <span>CharaManagerV2</span>
        </NuxtLink>
        <NavLinks />
    </nav>
</template>

<style scoped></style>
