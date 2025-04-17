<script setup lang="ts">
import { Filter, Menu, Pencil } from 'lucide-vue-next';
</script>

<template>
    <nav class="hidden sm:flex lg:hidden items-center w-full h-full gap-2 z-30">
        <Sheet>
            <SheetTrigger as-child>
                <Button variant="outline" size="icon" class="shrink-0 xl:hidden">
                    <Menu class="h-5 w-5" />
                    <span class="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-full">
                <RenderCacheable>
                    <NavMobile />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
        <NuxtLink to="/" class="flex items-center gap-1 h-full">
            <NuxtImg src="/logo.svg" alt="Logo" class="h-10 w-10 min-h-10 min-w-10" />
            <h1 class="text-lg font-semibold text-center">CharaManagerV2</h1>
        </NuxtLink>
        <div class="flex-1"></div>
        <NavSearch />
        <div class="flex flex-nowrap gap-1">
            <NavUserMenu />
        </div>
        <Sheet>
            <SheetTrigger as-child>
                <Button size="icon" class="w-14 shrink-0">
                    <Pencil class="h-5 w-5" />
                    <span class="sr-only">Toggle editor menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent iside="right" class="w-full md:w-[800px]">
                <RenderCacheable>
                    <CharsSidebar class="pt-4" />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
    </nav>
</template>

<style scoped></style>
