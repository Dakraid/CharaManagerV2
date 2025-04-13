<script lang="ts" setup>
const props = defineProps<{
    score: number;
    reason: string;
}>();

const normalizedScore = computed(() => Math.min(Math.max(props.score, 0), 100));
</script>

<template>
    <div class="w-full">
        <div class="relative h-4 w-full bg-muted rounded-full overflow-hidden">
            <div class="h-full w-full transition-all duration-500 ease-out gradient-scale"></div>
            <div
                class="absolute inset-0 h-full transition-all duration-500 ease-out bg-muted z-10"
                :style="{ left: `${normalizedScore}%`, width: `${100 - normalizedScore}%` }"></div>
            <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground text-background-shadow z-20">{{ normalizedScore.toFixed(0) }}%</div>
        </div>

        <p class="mt-2 text-sm text-foreground">
            {{ reason }}
        </p>
    </div>
</template>

<style scoped>
.gradient-scale {
    background-image: linear-gradient(to right, red, yellow, green);
}

.text-background-shadow {
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 1)) drop-shadow(0 0 1px rgb(0 0 0 / 1));
}
</style>
