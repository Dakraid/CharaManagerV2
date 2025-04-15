<script lang="ts" setup>
import { cn } from '~/lib/utils';

const props = defineProps<{
    score: number;
    reason?: string;
    subtext?: string;
    center?: boolean;
}>();

const normalizedScore = computed(() => Math.min(Math.max(props.score, 0), 100));
const styling = computed(() => {
    return {
        width: `${normalizedScore.value}%`,
        '--progress': `${100 - normalizedScore.value}%`,
    };
});
</script>

<template>
    <div class="w-full">
        <div class="relative h-6 w-full overflow-hidden rounded-full bg-muted">
            <div class="h-full transition-all duration-500 ease-out gradient-scale" :style="styling"></div>
            <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground text-background-shadow">
                {{ subtext ?? '' }}{{ normalizedScore.toFixed(0) }}%
            </div>
        </div>

        <p v-if="reason !== undefined" :class="cn('mt-2 text-sm text-foreground', center ? 'text-center' : '')">
            {{ reason }}
        </p>
    </div>
</template>

<style scoped>
.gradient-scale {
    --color-green: rgb(34 197 94);
    --color-yellow: rgb(234 179 8);
    --color-orange: rgb(249 115 22);
    --color-red: rgb(239 68 68);

    --_color-green: var(--color-green, yellowgreen);
    --_color-yellow: var(--color-yellow, gold);
    --_color-orange: var(--color-orange, orange);
    --_color-red: var(--color-red, red);

    --color-scale-1: color-mix(in oklch, var(--_color-green), var(--_color-yellow) var(--progress-1));
    --color-scale-2: color-mix(in oklch, var(--_color-yellow), var(--_color-orange) var(--progress-2));
    --color-scale-3: color-mix(in oklch, var(--_color-orange), var(--_color-red) var(--progress-3));

    --color-scale-12: color-mix(in oklch, var(--color-scale-1), var(--color-scale-2) var(--progress-12));
    --color-scale-23: color-mix(in oklch, var(--color-scale-2), var(--color-scale-3) var(--progress-23));
    --color-scale-123: color-mix(in oklch, var(--color-scale-12), var(--color-scale-23) var(--progress-123));

    --progress-ext: calc(var(--progress) * 3);

    --progress-123: clamp(0%, (var(--progress-ext) - 150%) * infinity, 100%);
    --progress-12: clamp(0%, (var(--progress-ext) - 150% + 75%) * infinity, 100%);
    --progress-23: clamp(0%, (var(--progress-ext) - 150% - 75%) * infinity, 100%);

    --progress-1: clamp(0%, var(--progress-ext), 100%);
    --progress-2: calc(clamp(100%, var(--progress-ext), 200%) - 100%);
    --progress-3: calc(clamp(200%, var(--progress-ext), 300%) - 200%);

    background: var(--color-scale-123, gray);

    --progress: 20%;
}

.text-background-shadow {
    filter: drop-shadow(0 0 1px rgb(0 0 0 / 1)) drop-shadow(0 0 1px rgb(0 0 0 / 1));
}
</style>
