<template>
    <div class="relative flex h-full w-full items-center justify-start gap-10 overflow-hidden sui-tyndall-effect" :style="wrapperStyle">
        <div
            v-motion
            class="pointer-events-none absolute h-24 flex-none overflow-hidden mix-blend-difference streak w-[200%] left-[-64vw] top-[48vw] lg:w-[150%] lg:left-[-28vw] lg:top-[32vw] lg:h-56 xl:left-[-16vw] xl:top-[21vw]"
            :initial="{ opacity: 0, rotate: '40deg', scaleY: 0.5 }"
            :enter="{ opacity: 0.32, rotate: '40deg', scaleY: 1 }"
            :duration="2000" />
        <div
            v-motion
            class="pointer-events-none absolute h-12 flex-none overflow-hidden mix-blend-difference streak w-[200%] left-[-60vw] top-[40vw] lg:w-[150%] lg:left-[-32vw] lg:top-[24vw] lg:h-24 xl:left-[-12vw] xl:top-[17vw]"
            :initial="{ opacity: 0, rotate: '32deg', scaleY: 0.5 }"
            :enter="{ opacity: 0.36, rotate: '32deg', scaleY: 1 }"
            :duration="2000" />
        <div
            v-motion
            class="pointer-events-none absolute h-20 flex-none overflow-hidden mix-blend-difference streak w-[200%] left-[-32vw] top-[32vw] lg:w-[150%] lg:left-[-12vw] lg:top-[16vw] lg:h-48 xl:left-[-10vw] xl:top-[10vw]"
            :initial="{ opacity: 0, rotate: '24deg', scaleY: 0.5 }"
            :enter="{ opacity: 0.4, rotate: '24deg', scaleY: 1 }"
            :duration="2000" />
        <div v-if="showOverlay" class="pointer-events-none absolute top-0 right-0 left-0 z-10 h-56 flex-none overflow-hidden overlay-top" />
        <div v-if="showOverlay" class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-32 flex-none overflow-hidden overlay-bottom" />
        <div v-if="$slots.particles" class="absolute top-0 right-0 left-0 h-screen flex-none particles-effect">
            <slot name="particles" />
        </div>
        <slot />
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        streakColor?: string;
        showOverlay?: boolean;
    }>(),
    {
        streakColor: 'rgb(255, 255, 255)',
        showOverlay: true,
    }
);

const { streakColor } = toRefs(props);

const wrapperStyle = computed(() => {
    return {
        '--streak-color': streakColor.value,
    };
});
</script>

<style scoped>
.sui-tyndall-effect {
    --streak-color: rgb(0, 225, 255);
}

.sui-tyndall-effect .overlay-top {
    background: linear-gradient(180deg, hsl(var(--background)) 0%, rgba(0, 0, 0, 0.32) 43%, rgba(0, 0, 0, 0.12) 70%, rgba(0, 0, 0, 0) 100%);
}

.sui-tyndall-effect .overlay-bottom {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.12) 43%, rgba(0, 0, 0, 0.32) 70%, hsl(var(--background)) 100%);
}

.sui-tyndall-effect .streak {
    background: linear-gradient(90deg, var(--streak-color) 16%, rgba(255, 255, 255, 0) 100%);
    mask: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 35%, rgba(0, 0, 0, 0.5) 64%, rgba(0, 0, 0, 0) 100%);
}

.sui-tyndall-effect .particles-effect {
    mask: linear-gradient(225deg, rgba(0, 0, 0, 0) 30%, rgb(0, 0, 0) 36%, rgb(0, 0, 0) 63%, rgba(0, 0, 0, 0) 76%);
}
</style>
