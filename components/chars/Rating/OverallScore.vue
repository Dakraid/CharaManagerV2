<script setup lang="ts">
import AiEvalDisplay from '~/components/chars/Rating/AiEvalDisplay.vue';
import { cn } from '~/lib/utils';

const props = defineProps<{
    character: Character;
}>();

const rating = ref<Rating | undefined>(undefined);
const isHovering = ref(false);
const hoveredRating = ref(0);

async function hoverRating(formattedRating: number) {
    hoveredRating.value = formattedRating;
}

rating.value = await $fetch<Rating>('/api/ratings/rating', {
    method: 'GET',
    query: {
        id: props.character.id,
    },
});
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
                <div class="flex flex-col items-center gap-2">
                    <p>Click to set rating</p>
                    <Separator />
                    <p>AI Evaluation</p>
                    <div class="flex flex-col gap-4 max-w-6xl">
                        <AiEvalDisplay
                            v-if="rating?.aiGrammarAndSpellingScore !== undefined && rating?.aiGrammarAndSpellingReason !== undefined"
                            :score="rating.aiGrammarAndSpellingScore"
                            :reason="rating.aiGrammarAndSpellingReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiAppearanceScore !== undefined && rating?.aiAppearanceReason !== undefined"
                            :score="rating.aiAppearanceScore"
                            :reason="rating.aiAppearanceReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiPersonalityScore !== undefined && rating?.aiPersonalityReason !== undefined"
                            :score="rating.aiPersonalityScore"
                            :reason="rating.aiPersonalityReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiBackgroundScore !== undefined && rating?.aiBackgroundReason !== undefined"
                            :score="rating.aiBackgroundScore"
                            :reason="rating.aiBackgroundReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiCreativeElementsScore !== undefined && rating?.aiCreativeElementsReason !== undefined"
                            :score="rating.aiCreativeElementsScore"
                            :reason="rating.aiCreativeElementsReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiConsistencyScore !== undefined && rating?.aiConsistencyReason !== undefined"
                            :score="rating.aiConsistencyScore"
                            :reason="rating.aiConsistencyReason" />
                        <AiEvalDisplay
                            v-if="rating?.aiStructureScore !== undefined && rating?.aiStructureReason !== undefined"
                            :score="rating.aiStructureScore"
                            :reason="rating.aiStructureReason" />
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped></style>
