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
const hoveredRating = ref(0);

const isCanvasHovered = ref(false);
const mousePosition = ref({ x: 0, y: 0 });

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');

const target = ref(null);
const targetIsVisible = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const zoomCanvasRef = ref<HTMLCanvasElement | null>(null);
const imageLoaded = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting;
    if (isIntersecting && !imageLoaded.value) {
        loadImage();
    }
});

const img = useImage();
const originalImage = ref<HTMLImageElement | null>(null);

async function loadImage() {
    if (!targetIsVisible.value || !canvasRef.value) return;

    try {
        const optimizedUrl = img(
            imageUri,
            {
                width: 512,
                height: 768,
                format: 'webp',
                quality: appStore.imageQuality,
            },
            {
                provider: 'ipx',
            }
        );

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            if (!canvasRef.value) return;

            const ctx = canvasRef.value.getContext('2d');
            if (!ctx) return;

            originalImage.value = image;

            ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

            // Apply blur filter if needed
            if (appStore.blurChars) {
                ctx.filter = 'blur(20px) grayscale(1)';
                ctx.translate(canvasRef.value.width, canvasRef.value.height);
                ctx.rotate(Math.PI);
            } else {
                ctx.filter = 'none';
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }

            ctx.drawImage(image, 0, 0, canvasRef.value.width, canvasRef.value.height);

            imageLoaded.value = true;
        };

        image.onerror = (error) => {
            console.error('Failed to load image:', error);
            if (canvasRef.value) {
                const ctx = canvasRef.value.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'hsl(var(--muted))';
                    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
                }
            }
        };

        image.src = optimizedUrl;
    } catch (error) {
        console.error('Error loading image:', error);
    }
}

function handleMouseMove(event: MouseEvent) {
    if (!canvasRef.value) return;

    const rect = canvasRef.value.getBoundingClientRect();
    mousePosition.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };

    updateZoom();
}

function updateZoom() {
    if (!zoomCanvasRef.value || !canvasRef.value || !originalImage.value || !imageLoaded.value || appStore.blurChars) return;

    const zoomCtx = zoomCanvasRef.value.getContext('2d');
    if (!zoomCtx) return;

    const { x, y } = mousePosition.value;
    const zoomWidth = zoomCanvasRef.value.width;
    const zoomHeight = zoomCanvasRef.value.height;

    zoomCtx.clearRect(0, 0, zoomWidth, zoomHeight);

    const sourceWidth = zoomWidth / appStore.zoomLevel;
    const sourceHeight = zoomHeight / appStore.zoomLevel;

    const sourceX = Math.max(0, Math.min(x - sourceWidth / 2, canvasRef.value.width - sourceWidth));
    const sourceY = Math.max(0, Math.min(y - sourceHeight / 2, canvasRef.value.height - sourceHeight));

    zoomCtx.drawImage(
        originalImage.value,
        sourceX * (originalImage.value.width / canvasRef.value.width),
        sourceY * (originalImage.value.height / canvasRef.value.height),
        sourceWidth * (originalImage.value.width / canvasRef.value.width),
        sourceHeight * (originalImage.value.height / canvasRef.value.height),
        0,
        0,
        zoomWidth,
        zoomHeight
    );
}

function handleMouseEnter() {
    isCanvasHovered.value = true;
}

function handleMouseLeave() {
    isCanvasHovered.value = false;
}

async function triggerDownload(character: Character) {
    isDownloading.value = true;
    downloadCharacter(character).then(() => {
        isDownloading.value = false;
    });
}

watch(
    () => appStore.blurChars,
    () => {
        if (imageLoaded.value) {
            loadImage();
        }
    }
);

watch(
    () => appStore.imageQuality,
    () => {
        if (imageLoaded.value) {
            imageLoaded.value = false;
            loadImage();
        }
    }
);
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
                <Skeleton v-if="!targetIsVisible || !imageLoaded" class="rounded-xl Image-Container h-[384px] w-[256px]" />
                <div
                    v-show="imageLoaded"
                    class="relative Image-Container canvas-wrapper"
                    @mouseenter="handleMouseEnter"
                    @mouseleave="handleMouseLeave"
                    @mousemove="handleMouseMove">
                    <canvas
                        :id="character.etag"
                        ref="canvasRef"
                        width="256"
                        height="384"
                        :class="cn('border rounded-xl transition-all mx-auto')"
                        :aria-label="character.charName"></canvas>
                    <canvas
                        v-show="isCanvasHovered && !appStore.blurChars"
                        ref="zoomCanvasRef"
                        width="256"
                        height="384"
                        class="absolute inset-0 rounded-xl zoom-canvas"
                        :style="{ opacity: isCanvasHovered ? 1 : 0 }"></canvas>
                </div>
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
                    <Button class="h-8 flex-1" :disabled="isDownloading" @click="triggerDownload(character)">
                        <div class="flex items-center justify-center gap-2">
                            <Transition name="fade" mode="out-in">
                                <LoaderCircle v-if="isDownloading" class="mx-auto h-4 w-4 motion-safe:animate-spin" />
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

.canvas-wrapper {
    position: relative;
    width: 256px;
    height: 384px;
    overflow: hidden;
    cursor: zoom-in;
}

.zoom-canvas {
    transition: opacity 0.2s;
    pointer-events: none;
}
</style>
