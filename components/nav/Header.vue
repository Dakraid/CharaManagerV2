<script setup lang="ts">
import { Check, Menu, Moon, Pencil, Search, Sun, SunMoon, UserCog } from 'lucide-vue-next';
import { debounce } from 'perfect-debounce';

const nuxtApp = useNuxtApp();
const colorMode = useColorMode();
const appStore = useAppStore();
const characterStore = useCharacterStore();

const inputKey = ref<string>('');
const searchQuery = ref<string>('');

async function updateImageQuality(quality: number) {
    appStore.imageQuality = quality;
}

async function performSearch(e: any) {
    await nuxtApp.hooks.callHook('characters:refresh');
    const debounceSearch = debounce(async () => {
        const { data } = await useFetch<Character[]>('/api/chars/search', {
            method: 'POST',
            body: {
                page: characterStore.currentPage,
                perPage: appStore.perPage,
                search: searchQuery.value,
            },
        });

        characterStore.count = data.value?.length ?? 0;
        characterStore.characters = data.value ?? undefined;
    }, 300);

    if (searchQuery.value.trim() === '') {
        await nuxtApp.hooks.callHook('characters:refresh');
    } else {
        await debounceSearch();
    }
    characterStore.loading = false;
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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger class="ml-auto flex-1 md:flex-initial">
                        <form>
                            <div class="relative">
                                <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input v-model="searchQuery" type="search" placeholder="Search..." class="pl-8 md:w-[300px]" @input="performSearch" />
                            </div>
                        </form>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <div class="flex flex-col justify-between gap-2 md:w-[300px]">
                            <h1 class="font-bold text-lg">Search Syntax</h1>
                            <div class="flex flex-col justify-between">
                                <p class="text-sm text-muted-foreground">Default search is by character name.</p>
                                <p class="text-sm text-muted-foreground">Following advanced syntax is supported.</p>
                                <p class="text-sm text-muted-foreground">Different options can be combined.</p>
                            </div>
                            <div class="flex flex-col gap-1 justify-between">
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">id:</p>
                                    <p class="text-sm font-mono"><>=</p>
                                    <p class="text-sm font-mono">integer (0 and above)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">rating:</p>
                                    <p class="text-sm font-mono"><>=</p>
                                    <p class="text-sm font-mono">integer (0 to 9)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">tokens:</p>
                                    <p class="text-sm font-mono"><>=</p>
                                    <p class="text-sm font-mono">integer (0 and above)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">desc:</p>
                                    <p class="text-sm font-mono">"string" (quotes required)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">date:</p>
                                    <p class="text-sm font-mono"><>=</p>
                                    <p class="text-sm font-mono">"YYYY-MM-DD" (quotes required)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">time:</p>
                                    <p class="text-sm font-mono"><>=</p>
                                    <p class="text-sm font-mono">"HH:mm" (quotes required, 24h)</p>
                                </div>
                                <div class="flex flex-row">
                                    <p class="text-sm font-mono">file:</p>
                                    <p class="text-sm font-mono">"string" (quotes required)</p>
                                </div>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
                                    Blur Characters?
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
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = CardSize.Default">
                        <Check v-if="appStore.cardSize == CardSize.Default" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Default</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-2" @click="appStore.cardSize = CardSize.Square">
                        <Check v-if="appStore.cardSize == CardSize.Square" class="h-[1.2rem] w-[1.2rem]" />
                        <h1>Card Square</h1>
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
