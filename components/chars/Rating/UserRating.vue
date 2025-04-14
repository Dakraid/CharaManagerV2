<script setup lang="ts">
const props = defineProps<{
    character: Character;
}>();

const isHovering = ref(false);
const hoveredRating = ref(0);

async function hoverRating(formattedRating: number) {
    hoveredRating.value = formattedRating;
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <NuxtRating
            :read-only="false"
            :rating-value="isHovering ? hoveredRating : (character.rating ?? 0)"
            :rating-count="9"
            :rating-step="1"
            :rating-content="[
                90, 27, 70, 31, 53, 42, 42, 53, 31, 70, 27, 90, 31, 110, 42, 127, 53, 138, 70, 149, 90, 153, 110, 149, 127, 138, 138, 127, 149, 110, 153, 90, 149, 70, 138, 53, 127,
                42, 110, 31,
            ]"
            active-color="hsl(var(--primary))"
            inactive-color="hsl(var(--secondary))"
            class="flex justify-between z-20"
            rating-size="24px"
            @rating-selected="updateRating(character, hoveredRating)"
            @rating-hovered="hoverRating"
            @mouseenter="
                () => {
                    isHovering = true;
                }
            "
            @mouseleave="
                () => {
                    isHovering = false;
                }
            " />
    </div>
</template>

<style scoped></style>
