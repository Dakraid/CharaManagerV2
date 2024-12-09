<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';

defineProps<{
    content: any;
}>();

defineEmits(['remove']);
</script>

<template>
    <div class="Preview border rounded-md">
        <img loading="lazy" class="Image aspect-square w-full object-cover rounded-xl mx-auto mb-4 last:mb-0" :src="content" alt="file.name" />
        <Button variant="destructive" size="icon" class="Button w-full h-full bg-destructive/50" @click="$emit('remove')">
            <CircleX class="h-4 w-4 z-10" />
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
