<script setup lang="ts">
import { cn } from '~/lib/utils';

defineProps<{
    character: Character;
}>();

const isHovering = ref(false);
const hoveredRating = ref(0);

async function hoverRating(formattedRating: number) {
    hoveredRating.value = formattedRating;
}
</script>

<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <NuxtRating
                    :read-only="false"
                    :rating-value="isHovering ? hoveredRating : (character.rating ?? 0)"
                    :rating-count="9"
                    :rating-step="1"
                    :rating-content="[28, 90, 90, 28, 152, 90, 90, 152]"
                    active-color="hsl(var(--primary))"
                    inactive-color="hsl(var(--secondary))"
                    class="flex justify-center z-20"
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
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <div class="flex justify-between gap-2">
                    <p>Click to set rating</p>
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped></style>
