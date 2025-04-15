<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';

defineProps<{
    content: any;
}>();

defineEmits(['remove']);
</script>

<template>
    <div class="rounded-md border Preview">
        <img loading="lazy" class="mx-auto mb-4 aspect-square w-full rounded-xl object-cover Image last:mb-0" :src="content" alt="file.name" />
        <Button variant="destructive" size="icon" class="h-full w-full Button bg-destructive/50" @click="$emit('remove')">
            <CircleX class="z-10 h-4 w-4" />
        </Button>
    </div>
</template>

<style scoped>
.Preview {
    display: grid;
    grid-template-columns: 1fr 2rem 0.25rem;
    grid-template-rows: 0.25rem 2rem 1fr;
    gap: 0;
}

.Image {
    grid-area: 1 / 1 / 4 / 4;
}

.Button {
    grid-area: 2 / 2 / 3 / 3;
}
</style>
