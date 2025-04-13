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
        :class="cn('m-0 p-0 h-[596px] transition-transform hover:scale-103')"
        :border-width="isHovered ? 3 : 1"
        :color="isHovered ? ['#A07CFE', '#FE8FB5', '#FFBE7B'] : '#666666'"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false">
        <Card class="flex flex-col w-80 h-[596px] border-0 p-4 px-4 gap-4">
            <CardHeader class="flex flex-col justify-center gap-4 p-0 z-10">
                <CardTitle class="grid grid-cols-[48px_1fr_48px] max-w-[288px] justify-between max-h-8 gap-4">
                    <Badge variant="outline" class="h-10 w-12 flex justify-center rounded-md">#{{ character.id }}</Badge>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <h1 class="leading-8 h-[40px] max-w-[160px] text-ellipsis whitespace-nowrap overflow-x-hidden hover:cursor-default">
                                    {{ appStore.censorNames ? replaceLettersWithHash(character.charName) : character.charName }}
                                </h1>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div class="flex justify-between gap-2">
                                    <p>{{ character.charName }}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="destructive" size="icon" class="h-10 w-12" @click="deleteCharacter(character)">
                        <Trash class="h-4 w-4" />
                    </Button>
                </CardTitle>
                <CharsRatingOverallScore :character="character" />
            </CardHeader>
            <CardContent class="Image-Grid w-[256px] mx-auto p-0 z-10 rounded-xl overflow-hidden transition-all">
                <Skeleton v-if="!targetIsVisible" class="Image-Container h-[384px] w-[256px] rounded-xl" />
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
                    placeholder-class="h-[384px] w-[256px] bg-muted rounded-xl"
                    :class="cn('Image-Container border rounded-xl transition-all mx-auto', appStore.blurChars ? 'blur-2xl rotate-180 grayscale' : '')" />
                <Badge variant="secondary" class="Token-Permanent-Container rounded-xl rounded-tl-none rounded-br-none"> Permanent: {{ character.tokensPermanent ?? -1 }}</Badge>
                <Badge variant="secondary" class="Token-Total-Container rounded-xl rounded-tr-none rounded-bl-none"> Total: {{ character.tokensTotal ?? -1 }}</Badge>
            </CardContent>
            <CardFooter class="flex flex-col p-0 mt-2 gap-4 z-10">
                <div class="w-full flex justify-between gap-8">
                    <Button class="flex-1 h-8" @click="showCharacter(character)">
                        <div class="flex gap-2 items-center justify-center">
                            <Pencil class="h-4 w-4" />
                            <span>Edit</span>
                        </div>
                    </Button>
                    <Button class="flex-1 h-8" :disabled="isDownloading" @click="triggerDownload(character)">
                        <div class="flex gap-2 items-center justify-center">
                            <Transition name="fade" mode="out-in">
                                <LoaderCircle v-if="isDownloading" class="h-4 w-4 mx-auto motion-safe:animate-spin" />
                                <Download v-else class="h-4 w-4" />
                            </Transition>
                            <span>Download</span>
                        </div>
                    </Button>
                </div>
                <div class="flex w-full justify-between gap-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <p class="text-sm text-muted-foreground hover:underline">Filename</p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div class="flex justify-between gap-2">
                                    <p>Uploaded as:</p>
                                    <p>{{ character.fileName }}</p>
                                </div>
                                <div class="flex justify-between gap-2">
                                    <p>Download as:</p>
                                    <p>{{ `${character.charName}_${dayjs(character.uploadDate).format('YYYY-MM-DD_HH-mm-ss')}.png` }}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <h1 class="text-sm text-muted-foreground">{{ character.uploadDate }}</h1>
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
