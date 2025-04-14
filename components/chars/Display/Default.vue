<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import dayjs from 'dayjs';
import { Download, LoaderCircle, Pencil, Trash } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const props = defineProps<{
    character: Character;
}>();

const runtimeConfig = useRuntimeConfig();
const appStore = useAppStore();

const imageUri = runtimeConfig.public.imageDomain.endsWith('/')
    ? `${runtimeConfig.public.imageDomain}thumb/${props.character.id}.png`
    : `${runtimeConfig.public.imageDomain}/thumb/${props.character.id}.png`;

const isDownloading = ref(false);
const isHovered = ref(false);

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting;
});

async function triggerDownload(character: Character) {
    isDownloading.value = true;
    downloadCharacter(character).then(() => {
        isDownloading.value = false;
    });
}
</script>

<template>
    <inspiraGlowBorder
        id="target"
        ref="target"
        :class="cn('m-0 p-0 h-[596px] w-[300px] transition-transform hover:scale-103')"
        :border-width="isHovered ? 3 : 1"
        :color="isHovered ? ['#A07CFE', '#FE8FB5', '#FFBE7B'] : '#666666'"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false">
        <Card class="flex flex-col gap-4 border-0 p-4 px-4 h-[596px] w-[300px]">
            <CardHeader class="z-10 mx-auto flex flex-col justify-center gap-2 p-0 w-[256px]">
                <CardTitle class="grid grid-cols-[48px_1fr]">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" class="flex h-8 w-12 justify-center rounded-md rounded-r-none">#{{ character.id }}</Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div class="flex flex-col items-center p-1">
                                    <Separator label="Upload Date" class="mb-4" />
                                    <p>{{ dayjs(character.uploadDate).format('DD.MM.YYYY HH:mm:ss') }}</p>
                                    <Separator label="Filename" class="my-4" />
                                    <p>{{ `${character.charName}_${dayjs(character.uploadDate).format('YYYY-MM-DD_HH-mm-ss')}.png` }}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" class="flex h-8 justify-center rounded-md rounded-l-none border-l-0 w-[208px] hover:cursor-default">
                                    <p class="truncate text-base font-bold">{{ appStore.censorNames ? replaceLettersWithHash(character.charName) : character.charName }}</p>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div class="flex justify-between gap-2">
                                    <p>{{ character.charName }}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <CharsRatingUserRating :character="character" />
            </CardHeader>
            <CardContent class="z-10 mx-auto overflow-hidden rounded-xl p-0 transition-all Image-Grid w-[256px]">
                <Skeleton v-if="!targetIsVisible" class="rounded-xl Image-Container h-[384px] w-[256px]" />
                <NuxtImg
                    v-else
                    :id="character.etag"
                    :key="character.etag"
                    :src="imageUri"
                    :alt="character.charName"
                    format="webp"
                    :quality="appStore.imageQuality"
                    width="256"
                    height="384"
                    loading="lazy"
                    placeholder="Placeholder.png"
                    placeholder-class="rounded-xl h-[384px] w-[256px] bg-muted"
                    :class="cn('Image-Container border rounded-xl transition-all mx-auto', appStore.blurChars ? 'blur-2xl rotate-180 grayscale' : '')" />
                <Badge variant="secondary" class="rounded-xl rounded-tl-none rounded-br-none Token-Permanent-Container"> Permanent: {{ character.tokensPermanent ?? -1 }}</Badge>
                <Badge variant="secondary" class="rounded-xl rounded-tr-none rounded-bl-none Token-Total-Container"> Total: {{ character.tokensTotal ?? -1 }}</Badge>
            </CardContent>
            <CardFooter class="z-10 mx-auto flex flex-col gap-4 p-0 w-[256px]">
                <CharsRatingAiRating :character="character" class="h-6 w-full" />
                <div class="grid w-full gap-2 grid-cols-[min-content_1fr_1fr]">
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button variant="destructive" size="icon" class="h-8">
                                <Trash class="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription> This action cannot be undone. This will permanently delete the character and any data associated.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction @click="deleteCharacter(character)">Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button class="h-8 w-full" @click="showCharacter(character)">
                        <Pencil class="h-4 w-4" />
                    </Button>
                    <Button class="h-8 w-full" :disabled="isDownloading" @click="triggerDownload(character)">
                        <Transition name="fade" mode="out-in">
                            <LoaderCircle v-if="isDownloading" class="mx-auto h-4 w-4 motion-safe:animate-spin" />
                            <Download v-else class="h-4 w-4" />
                        </Transition>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    </inspiraGlowBorder>
</template>

<style scoped>
.Image-Grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr min-content;
    gap: 0 0.5rem;
    grid-auto-flow: row;
}

.Image-Container {
    grid-area: 1 / 1 / 3 / 3;
}

.Token-Total-Container {
    grid-area: 2 / 2 / 3 / 3;
    display: flex;
    justify-content: end;
}

.Token-Permanent-Container {
    grid-area: 2 / 1 / 3 / 2;
    display: flex;
    justify-content: start;
}
</style>
