<script setup lang="ts"></script>

<template>
    <nav class="flex flex-col justify-center items-center gap-4 text-lg font-medium w-full">
        <NuxtLink to="/" class="flex w-fit items-center gap-2 text-lg font-semibold">
            <NuxtImg src="/logo.svg" alt="Logo" class="h-10 w-10 min-h-10 min-w-10" />
            <span>CharaManagerV2</span>
        </NuxtLink>
        <div class="h-full w-full flex flex-col gap-2">
            <NavLinks />
        </div>
    </nav>
</template>

<style scoped></style>
