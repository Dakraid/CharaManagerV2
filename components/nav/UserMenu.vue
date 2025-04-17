<script setup lang="ts">
import { Check, Moon, Sun, SunMoon, UserCog } from 'lucide-vue-next';

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
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="outline">
                <UserCog class="h-5 w-5" />
                <span class="sr-only">Toggle user menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                <div class="flex w-full max-w-sm flex-col gap-1">
                    <NuxtLink to="/authenticate" class="flex w-full items-center gap-2 text-lg font-semibold">
                        <Button class="w-full">User Management</Button>
                    </NuxtLink>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'light'">
                <Check v-if="colorMode.preference === 'light'" class="h-[1.2rem] w-[1.2rem]" />
                <Sun class="h-[1.2rem] w-[1.2rem]" />
                <h1>Light</h1>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'dark'">
                <Check v-if="colorMode.preference === 'dark'" class="h-[1.2rem] w-[1.2rem]" />
                <Moon class="h-[1.2rem] w-[1.2rem]" />
                <h1>Dark</h1>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex gap-2" @click="colorMode.preference = 'system'">
                <Check v-if="colorMode.preference === 'system'" class="h-[1.2rem] w-[1.2rem]" />
                <SunMoon class="h-[1.2rem] w-[1.2rem]" />
                <h1>System</h1>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Censor</DropdownMenuLabel>
            <DropdownMenuLabel>
                <div class="flex w-full max-w-sm gap-2 items-top">
                    <Checkbox id="blurChars" v-model:checked="appStore.blurChars" />
                    <div class="grid gap-2 leading-none">
                        <label for="blurChars" class="peer-disabled:cursor-not-allowed text-center text-sm font-medium leading-none peer-disabled:opacity-70">
                            Censor Characters?
                        </label>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuLabel>
                <div class="flex w-full max-w-sm gap-2 items-top">
                    <Checkbox id="censorNames" v-model:checked="appStore.censorNames" />
                    <div class="grid gap-2 leading-none">
                        <label for="censorNames" class="peer-disabled:cursor-not-allowed text-center text-sm font-medium leading-none peer-disabled:opacity-70">
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
                <div class="flex w-full max-w-sm gap-2 items-top">
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
            <DropdownMenuLabel>Zoom Level (0.5 Zoom out - 5 Zoom In)</DropdownMenuLabel>
            <DropdownMenuLabel>
                <div class="flex w-full max-w-sm gap-2 items-top">
                    <NumberField id="zoomLevel" :default-value="appStore.zoomLevel" :min="0.5" :max="5" :step="0.5" @update:model-value="updateZoomLevel">
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
</template>

<style scoped></style>
