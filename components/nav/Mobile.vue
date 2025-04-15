<script setup lang="ts"></script>

<template>
    <nav class="grid gap-4 text-lg font-medium">
        <NuxtLink to="/" class="flex w-fit items-center gap-2 text-lg font-semibold">
            <NuxtImg src="/logo.svg" alt="Logo" class="h-10 w-10 min-h-10 min-w-10" />
            <span>CharaManagerV2</span>
        </NuxtLink>
        <NavLinks />
    </nav>
</template>

<style scoped></style>
