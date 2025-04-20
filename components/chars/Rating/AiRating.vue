<script setup lang="ts">
const props = defineProps<{
    character: Character;
}>();

const rating = ref<RatingWithEval | undefined>(undefined);
const average = ref(0);

if (props.character.charName) {
    rating.value = await $fetch<RatingWithEval>('/api/ratings/rating', {
        method: 'GET',
        query: {
            id: props.character.id,
        },
    });

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
}
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-if="rating === undefined" class="flex flex-col">
            <Skeleton class="h-6 w-full rounded-full" />
        </div>
        <div v-else class="flex flex-col">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <CharsRatingAiEvalDisplay :score="average" subtext="AI Evaluation Score: " />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <div class="flex max-w-6xl flex-col items-center gap-2">
                            <h1 class="text-lg font-bold">Evaluation Breakdown</h1>
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
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
