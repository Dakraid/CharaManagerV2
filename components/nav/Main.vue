<script setup lang="ts">
const { loggedIn } = useUserSession();
</script>

<template>
    <header class="sticky top-0 z-20 h-16 border-b bg-background px-2">
        <Transition name="fade" mode="out-in">
            <NuxtLink v-if="!loggedIn" to="/" class="flex items-center gap-2 h-full">
                <NuxtImg src="/logo.svg" alt="Logo" class="h-10 w-10 min-h-10 min-w-10" />
                <h1 class="text-lg font-semibold text-center">CharaManagerV2</h1>
            </NuxtLink>
            <div v-else class="h-full">
                <NavLarge />
                <NavMedium />
                <NavSmall />
            </div>
        </Transition>
    </header>
</template>

<style scoped></style>
