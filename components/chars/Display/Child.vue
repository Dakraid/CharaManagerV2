<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import dayjs from 'dayjs';
import { FileDiff, Pencil, Trash } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const props = defineProps<{
    character: Character;
}>();

defineEmits(['compare']);

const runtimeConfig = useRuntimeConfig();
const appStore = useAppStore();

const imageUri = runtimeConfig.public.imageDomain.endsWith('/')
    ? `${runtimeConfig.public.imageDomain}thumb/${props.character.id}.png`
    : `${runtimeConfig.public.imageDomain}/thumb/${props.character.id}.png`;

const isHovered = ref(false);
const hoveredRating = ref(0);

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting;
});
</script>

<template>
    <inspiraGlowBorder
        id="target"
        ref="target"
        :class="cn('m-0 p-0 h-[596px] transition-transform hover:scale-103')"
        :border-width="isHovered ? 2 : 0"
        :color="['#A07CFE', '#FE8FB5', '#FFBE7B']"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false">
        <Card class="flex w-80 flex-col gap-4 border-0 p-4 px-4 h-[596px]">
            <CardHeader class="z-10 flex flex-col justify-center gap-4 p-0">
                <CardTitle class="grid max-h-8 justify-between gap-4 grid-cols-[48px_1fr_48px] max-w-[288px]">
                    <Badge variant="outline" class="flex h-10 w-12 justify-center rounded-md">#{{ character.id }}</Badge>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <h1 class="overflow-x-hidden text-ellipsis whitespace-nowrap leading-8 h-[40px] max-w-[160px] hover:cursor-default">
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
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <NuxtRating
                                :read-only="false"
                                :rating-value="character.rating ?? 0"
                                :rating-count="9"
                                :rating-step="1"
                                :rating-content="[28, 90, 90, 28, 152, 90, 90, 152]"
                                active-color="hsl(var(--primary))"
                                inactive-color="hsl(var(--secondary))"
                                class="z-20 flex justify-center"
                                rating-size="24px"
                                @rating-selected="updateRating(character, hoveredRating)"
                                @rating-hovered="(event) => (hoveredRating = event)" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <div class="flex justify-between gap-2">
                                <p>Click to set rating</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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
            <CardFooter class="z-10 mt-2 flex flex-col gap-4 p-0">
                <div class="flex w-full justify-between gap-8">
                    <Button class="h-8 flex-1" @click="showCharacter(character)">
                        <div class="flex items-center justify-center gap-2">
                            <Pencil class="h-4 w-4" />
                            <span>Edit</span>
                        </div>
                    </Button>
                    <Button class="h-8 flex-1" @click="$emit('compare')">
                        <div class="flex items-center justify-center gap-2">
                            <FileDiff class="h-4 w-4" />
                            <span>Compare</span>
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
