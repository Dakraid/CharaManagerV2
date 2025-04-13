// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedGlobalSymbols
import { eq, isNull, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { z } from 'zod';

const scoreSchema = z.object({
    score: z.number().min(1).max(100),
    reason: z.string(),
});

const evaluationSchema = z.object({
    grammarAndSpelling: scoreSchema,
    appearance: scoreSchema,
    personality: scoreSchema,
    background: scoreSchema,
    creativeElements: scoreSchema,
    consistency: scoreSchema,
    structure: scoreSchema,
});

type Evaluation = z.infer<typeof evaluationSchema>;

async function getEvaluation(
    apiKey: string,
    model: string,
    characterId: number,
    systemPrompt: string,
    evaluationText: string,
    retryLimit: number = 3,
    retry: number = 1
): Promise<{
    id: number;
    evaluation: Evaluation | undefined;
}> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            provider: {
                order: ['Mistral', 'Parasail'],
            },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: evaluationText },
            ],
            temperature: 0.3,
            require_parameters: true,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'evaluation',
                    strict: true,
                    schema: {
                        type: 'object',
                        properties: {
                            grammarAndSpelling: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            appearance: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            personality: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            background: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            creativeElements: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            consistency: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                            structure: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                        minimum: 1,
                                        maximum: 100,
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                            },
                        },
                        required: ['grammarAndSpelling', 'appearance', 'personality', 'background', 'creativeElements', 'consistency', 'structure'],
                        additionalProperties: false,
                    },
                },
            },
        }),
    });

    const data = await response.json();
    try {
        const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/;
        const codeBlockMatch = data.choices[0].message.content.match(codeBlockRegex);

        if (codeBlockMatch && codeBlockMatch[1]) {
            const rawData = JSON.parse(codeBlockMatch[1]);
            return { id: characterId, evaluation: evaluationSchema.parse(rawData) };
        }

        try {
            const entireContent = data.choices[0].message.content.trim();
            const rawData = JSON.parse(entireContent);
            return { id: characterId, evaluation: evaluationSchema.parse(rawData) };
        } catch (innerError) {
            console.error('Content is not valid JSON:', innerError);
        }

        throw new Error('Failed to extract valid JSON from response.');
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error('Failed to parse JSON:', error);
        } else {
            console.error('Invalid evaluation data:', error);
        }
    }

    if (retry < retryLimit) {
        return await getEvaluation(apiKey, model, characterId, systemPrompt, evaluationText, retryLimit, retry + 1);
    }

    return { id: characterId, evaluation: undefined };
}

// noinspection JSUnusedLocalSymbols
export default defineTask({
    meta: {
        name: 'ratings:generate',
        description: 'Generate AI-based ratings',
    },
    async run({ payload, context }) {
        console.log('Running rating generation task...');
        const runtimeConfig = useRuntimeConfig();

        const { Pool } = pg;
        const pool = new Pool({
            host: runtimeConfig.dbHost,
            user: runtimeConfig.dbUser,
            password: runtimeConfig.dbPassword,
            database: runtimeConfig.dbDatabase,
        });

        const db = drizzle({ client: pool });

        const characterDefs = await db
            .select()
            .from(characters)
            .leftJoin(definitions, eq(characters.id, definitions.id))
            .leftJoin(ratings, eq(characters.id, ratings.id))
            .where(
                or(
                    isNull(ratings.aiGrammarAndSpellingScore),
                    isNull(ratings.aiAppearanceScore),
                    isNull(ratings.aiPersonalityScore),
                    isNull(ratings.aiBackgroundScore),
                    isNull(ratings.aiCreativeElementsScore),
                    isNull(ratings.aiConsistencyScore),
                    isNull(ratings.aiStructureScore)
                )
            );

        const chunkSize = 10;
        const successfulEvaluations: { id: number; evaluation: Evaluation }[] = [];
        const failedEvaluations: { id: number }[] = [];

        for (let i = 0; i < characterDefs.length; i += chunkSize) {
            const chunk = characterDefs.slice(i, i + chunkSize);

            const chunkPromises = chunk.map(async (characterDef) => {
                try {
                    if (!characterDef.definitions?.definition) {
                        throw new Error('Empty definition received.');
                    }

                    const json = JSON.parse(characterDef.definitions.definition);
                    return await getEvaluation(
                        runtimeConfig.openRouterKey,
                        runtimeConfig.openRouterModel,
                        characterDef.characters.id,
                        runtimeConfig.evaluationSysPrompt,
                        `# Description:\n${json.data.description}\n# Intro:\n${json.data.first_mes}`
                    );
                } catch (err: any) {
                    console.error(`Failed to getScores for character ${characterDef.characters.id}: ${err.message}`);
                    return { id: characterDef.characters.id, evaluation: undefined };
                }
            });

            const chunkResults = await Promise.all(chunkPromises);
            for (const result of chunkResults) {
                if (result.evaluation) {
                    successfulEvaluations.push(result as { id: number; evaluation: Evaluation });
                } else {
                    failedEvaluations.push({ id: result.id });
                }
            }

            console.log(`Completed ${i + chunkSize} out of ${characterDefs.length} total.`);
            await Sleep(1000);
        }

        for (const successfulEvaluation of successfulEvaluations) {
            await db
                .insert(ratings)
                .values({
                    id: successfulEvaluation.id,
                    aiGrammarAndSpellingScore: successfulEvaluation.evaluation.grammarAndSpelling.score,
                    aiGrammarAndSpellingReason: successfulEvaluation.evaluation.grammarAndSpelling.reason,
                    aiAppearanceScore: successfulEvaluation.evaluation.appearance.score,
                    aiAppearanceReason: successfulEvaluation.evaluation.appearance.reason,
                    aiPersonalityScore: successfulEvaluation.evaluation.personality.score,
                    aiPersonalityReason: successfulEvaluation.evaluation.personality.reason,
                    aiBackgroundScore: successfulEvaluation.evaluation.background.score,
                    aiBackgroundReason: successfulEvaluation.evaluation.background.reason,
                    aiCreativeElementsScore: successfulEvaluation.evaluation.creativeElements.score,
                    aiCreativeElementsReason: successfulEvaluation.evaluation.creativeElements.reason,
                    aiConsistencyScore: successfulEvaluation.evaluation.consistency.score,
                    aiConsistencyReason: successfulEvaluation.evaluation.consistency.reason,
                    aiStructureScore: successfulEvaluation.evaluation.structure.score,
                    aiStructureReason: successfulEvaluation.evaluation.structure.reason,
                })
                .onConflictDoUpdate({
                    target: ratings.id,
                    set: {
                        aiGrammarAndSpellingScore: successfulEvaluation.evaluation.grammarAndSpelling.score,
                        aiGrammarAndSpellingReason: successfulEvaluation.evaluation.grammarAndSpelling.reason,
                        aiAppearanceScore: successfulEvaluation.evaluation.appearance.score,
                        aiAppearanceReason: successfulEvaluation.evaluation.appearance.reason,
                        aiPersonalityScore: successfulEvaluation.evaluation.personality.score,
                        aiPersonalityReason: successfulEvaluation.evaluation.personality.reason,
                        aiBackgroundScore: successfulEvaluation.evaluation.background.score,
                        aiBackgroundReason: successfulEvaluation.evaluation.background.reason,
                        aiCreativeElementsScore: successfulEvaluation.evaluation.creativeElements.score,
                        aiCreativeElementsReason: successfulEvaluation.evaluation.creativeElements.reason,
                        aiConsistencyScore: successfulEvaluation.evaluation.consistency.score,
                        aiConsistencyReason: successfulEvaluation.evaluation.consistency.reason,
                        aiStructureScore: successfulEvaluation.evaluation.structure.score,
                        aiStructureReason: successfulEvaluation.evaluation.structure.reason,
                    },
                });
        }

        if (failedEvaluations.length > 0) {
            console.warn(`Completed rating generation task with ${failedEvaluations.length} failures.`);
        } else {
            console.log('Completed rating generation task...');
        }

        return { result: 'Success' };
    },
});
