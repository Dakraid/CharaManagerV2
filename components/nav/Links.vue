<script setup lang="ts">
import { ChartLine, Home, Logs, Waypoints } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const route = useRoute();
</script>

<template>
    <NuxtLink
        to="/"
        :class="
            cn(
                'px-4 py-2 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent cursor-pointer',
                route.path === '/' || route.path.startsWith('/?') ? 'text-foreground bg-accent' : ''
            )
        ">
        <div class="flex justify-center items-center gap-2">
            <Home class="h-[1.2rem] w-[1.2rem]" />
            Home
        </div>
    </NuxtLink>
    <NuxtLink
        to="/relations"
        :class="
            cn(
                'px-4 py-2 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent cursor-pointer',
                route.path === '/relations' ? 'text-foreground bg-accent' : ''
            )
        ">
        <div class="flex justify-center items-center gap-2">
            <Waypoints class="h-[1.2rem] w-[1.2rem]" />
            Relations
        </div>
    </NuxtLink>
    <NuxtLink
        to="/statistics"
        :class="
            cn(
                'px-4 py-2 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent cursor-pointer',
                route.path === '/statistics' ? 'text-foreground bg-accent' : ''
            )
        ">
        <div class="flex justify-center items-center gap-2">
            <ChartLine class="h-[1.2rem] w-[1.2rem]" />
            Statistics
        </div>
    </NuxtLink>
    <NuxtLink
        to="/logging"
        :class="
            cn(
                'px-4 py-2 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent cursor-pointer',
                route.path === '/logging' ? 'text-foreground bg-accent' : ''
            )
        ">
        <div class="flex justify-center items-center gap-2">
            <Logs class="h-[1.2rem] w-[1.2rem]" />
            Logging
        </div>
    </NuxtLink>
</template>

<style scoped></style>
