<script setup lang="ts">
const props = defineProps<{
    character: Character;
}>();

const rating = ref<RatingWithEval | undefined>(undefined);
const isHovering = ref(false);
const hoveredRating = ref(0);

async function hoverRating(formattedRating: number) {
    hoveredRating.value = formattedRating;
}

rating.value = await $fetch<RatingWithEval>('/api/ratings/rating', {
    method: 'GET',
    query: {
        id: props.character.id,
    },
});

const average = ref(0);
average.value =
    (rating.value.aiGrammarAndSpellingScore +
        rating.value.aiAppearanceScore +
        rating.value.aiPersonalityScore +
        rating.value.aiBackgroundScore +
        rating.value.aiIntroductionScore +
        rating.value.aiCreativeElementsScore +
        rating.value.aiConsistencyScore +
        rating.value.aiStructureScore) /
    8;
</script>

<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <div class="flex flex-col gap-2">
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
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <div v-if="rating !== undefined" class="flex flex-col items-center gap-2 max-w-6xl">
                    <h1 class="font-bold text-lg">AI Evaluation</h1>
                    <CharsRatingAiEvalDisplay :score="average" subtext="Overall Average: " />
                    <Separator label="Evaluation Breakdown" class="my-2" />
                    <CharsRatingAiEvalDisplay :score="rating.aiGrammarAndSpellingScore" :reason="rating.aiGrammarAndSpellingReason" subtext="Grammar & Spelling: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiAppearanceScore" :reason="rating.aiAppearanceReason" subtext="Appearance: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiPersonalityScore" :reason="rating.aiPersonalityReason" subtext="Personality: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiBackgroundScore" :reason="rating.aiBackgroundReason" subtext="Background: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiIntroductionScore" :reason="rating.aiIntroductionReason" subtext="Introduction: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiCreativeElementsScore" :reason="rating.aiCreativeElementsReason" subtext="Creative Elements: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiConsistencyScore" :reason="rating.aiConsistencyReason" subtext="Consistency: " />
                    <Separator />
                    <CharsRatingAiEvalDisplay :score="rating.aiStructureScore" :reason="rating.aiStructureReason" subtext="Structure: " />
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped></style>
