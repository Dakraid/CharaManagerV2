<script setup lang="ts">
import { cn } from '@/lib/utils';
import { ScrollAreaCorner, ScrollAreaRoot, type ScrollAreaRootProps, ScrollAreaViewport } from 'radix-vue';
import { type HTMLAttributes, computed } from 'vue';

import ScrollBar from './ScrollBar.vue';

defineEmits(['onScroll']);
const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});
</script>

<template>
    <ScrollAreaRoot v-bind="delegatedProps" :class="cn('relative overflow-hidden', props.class)">
        <ScrollAreaViewport class="h-full w-full scroll-smooth rounded-[inherit] reka-scroll-area-viewport" @scroll="$emit('onScroll')">
            <slot />
        </ScrollAreaViewport>
        <ScrollBar />
        <ScrollAreaCorner />
    </ScrollAreaRoot>
</template>
