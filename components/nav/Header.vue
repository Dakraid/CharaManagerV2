<script setup lang="ts">
import { Check, Filter, Menu, Moon, Pencil, Sun, SunMoon, UserCog } from 'lucide-vue-next';

const colorMode = useColorMode();
const appStore = useAppStore();

async function updateImageQuality(quality: number) {
    appStore.imageQuality = quality;
}

async function updateZoomLevel(zoomLevel: number) {
    appStore.zoomLevel = zoomLevel;
}
</script>

<template>
    <header class="sticky top-0 z-20 flex h-16 items-center gap-2 border-b px-4 bg-background xl:px-6">
        <div class="hidden items-center gap-2 text-lg font-semibold lg:flex lg:text-base"></div>
        <RenderCacheable class="hidden xl:flex">
            <NavDesktop />
        </RenderCacheable>
        <Sheet>
            <SheetTrigger as-child>
                <Button variant="outline" size="icon" class="shrink-0 xl:hidden">
                    <Menu class="h-5 w-5" />
                    <span class="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <RenderCacheable>
                    <NavMobile />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
        <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 xl:gap-4">
            <NavSearch class="ml-auto hidden flex-1 sm:flex xl:flex-initial" />
            <div class="flex-1 md:hidden"></div>
            <DropdownMenu class="block md:hidden">
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
        </div>
        <Sheet>
            <SheetTrigger as-child>
                <Button size="icon" class="ml-2 w-14 shrink-0">
                    <Pencil class="h-5 w-5" />
                    <span class="sr-only">Toggle editor menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent id="sidebar-tabs" side="right" class="w-full md:w-[800px]">
                <RenderCacheable>
                    <CharsSidebar class="pt-4" />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
    </header>
</template>

<style scoped></style>
