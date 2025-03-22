<script setup lang="ts">
import { Check, Menu, Moon, Pencil, Sun, SunMoon, UserCog } from 'lucide-vue-next';

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
    <header class="sticky top-0 flex h-16 items-center gap-2 border-b bg-background px-4 md:px-6 z-20">
        <div class="hidden lg:flex items-center gap-2 text-lg font-semibold lg:text-base"></div>
        <RenderCacheable class="hidden lg:flex">
            <NavDesktop />
        </RenderCacheable>
        <Sheet>
            <SheetTrigger as-child>
                <Button variant="outline" size="icon" class="shrink-0 lg:hidden">
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
        <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <NavSearch class="ml-auto flex-1 md:flex-initial" />
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline">
                        <Moon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Sun class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span class="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'light'">
                        <Sun class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Light</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'dark'">
                        <Moon class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Dark</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'system'">
                        <SunMoon class="h-[1.2rem] w-[1.2rem]" />
                        <h1>System</h1>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline">
                        <UserCog class="h-5 w-5" />
                        <span class="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <div class="flex flex-col w-full max-w-sm gap-1">
                            <NuxtLink to="/authenticate" class="flex items-center gap-2 text-lg font-semibold w-full">
                                <Button class="w-full">User Management</Button>
                            </NuxtLink>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Censor</DropdownMenuLabel>
                    <DropdownMenuLabel>
                        <div class="flex w-full max-w-sm items-top gap-2">
                            <Checkbox id="blurChars" v-model:checked="appStore.blurChars" />
                            <div class="grid gap-2 leading-none">
                                <label for="blurChars" class="text-sm text-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Censor Characters?
                                </label>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuLabel>
                        <div class="flex w-full max-w-sm items-top gap-2">
                            <Checkbox id="censorNames" v-model:checked="appStore.censorNames" />
                            <div class="grid gap-2 leading-none">
                                <label for="censorNames" class="text-sm text-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Censor Character Names?
                                </label>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Card Size</DropdownMenuLabel>
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = 0">
                        <Check v-if="appStore.cardSize == 0" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Default</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = 1">
                        <Check v-if="appStore.cardSize == 1" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Square</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = 2">
                        <Check v-if="appStore.cardSize == 2" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Parallax</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = 3">
                        <Check v-if="appStore.cardSize == 3" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Canvas</h1>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Image Quality (1 Worst - 100 Best)</DropdownMenuLabel>
                    <DropdownMenuLabel>
                        <div class="flex w-full max-w-sm items-top gap-2">
                            <NumberField id="imageQuality" :default-value="appStore.imageQuality" :min="1" :max="100" @update:model-value="updateImageQuality">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Zoom Level (0.5 Zoom out - 2 Zoom In)</DropdownMenuLabel>
                    <DropdownMenuLabel>
                        <div class="flex w-full max-w-sm items-top gap-2">
                            <NumberField id="zoomLevel" :default-value="appStore.zoomLevel" :min="0.5" :max="2" :step="0.5" @update:model-value="updateZoomLevel">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Sheet>
            <SheetTrigger as-child>
                <Button variant="outline" size="icon" class="shrink-0 lg:hidden">
                    <Pencil class="h-5 w-5" />
                    <span class="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent id="sidebar-tabs" side="right" class="w-full">
                <RenderCacheable>
                    <CharsSidebar class="pt-4" />
                </RenderCacheable>
            </SheetContent>
        </Sheet>
    </header>
</template>

<style scoped></style>
