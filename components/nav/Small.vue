<script setup lang="ts">
import { Filter, Menu, Pencil } from 'lucide-vue-next';
</script>

<template>
    <nav class="flex sm:hidden items-center w-full h-full gap-2 z-30">
        <Sheet>
            <SheetTrigger as-child>
                <Button variant="outline" size="icon">
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
        <div class="flex-1"></div>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button variant="outline">
                    <Filter class="h-[1.2rem] w-[1.2rem]" />
                    <span class="sr-only">Search</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <NavSearch class="ml-auto flex-1 md:flex-initial" />
            </DropdownMenuContent>
        </DropdownMenu>
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
            <SheetContent side="right" class="w-full md:w-[800px]">
                <RenderCacheable>
                    <CharsSidebar class="pt-4" />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
    </nav>
</template>

<style scoped></style>
