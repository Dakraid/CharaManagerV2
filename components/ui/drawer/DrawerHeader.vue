<script lang="ts" setup>
import { cn } from '@/lib/utils';
import type { HtmlHTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HtmlHTMLAttributes['class'];
}>();
</script>

<template>
    <div :class="cn('grid gap-1.5 p-4 text-center sm:text-left', props.class)">
        <slot />
    </div>
</template>
