// noinspection JSUnusedGlobalSymbols
import dayjs from 'dayjs';
import { eq, isNull, lte, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { jsonrepair } from 'jsonrepair';
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
    introduction: scoreSchema,
    creativeElements: scoreSchema,
    consistency: scoreSchema,
    structure: scoreSchema,
});

type Evaluation = z.infer<typeof evaluationSchema>;

async function parseEvaluationFromCodeBlock(data: string, useRepair = false): Promise<Evaluation | undefined> {
    try {
        const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/;
        const codeBlockMatch = data.match(codeBlockRegex);

        if (codeBlockMatch && codeBlockMatch[1]) {
            const rawData = JSON.parse(useRepair ? jsonrepair(codeBlockMatch[1]) : codeBlockMatch[1]);
            return evaluationSchema.parse(rawData);
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            if (!useRepair) {
                return parseEvaluationFromCodeBlock(data, true);
            }

            console.error('Failed to parse JSON:', error);
        } else {
            console.error('Invalid evaluation data:', error);
        }
    }
}

async function parseEvaluationFromEntireContent(data: string, useRepair = false): Promise<Evaluation | undefined> {
    try {
        const rawData = JSON.parse(useRepair ? jsonrepair(data) : data);
        return evaluationSchema.parse(rawData);
    } catch (error) {
        if (error instanceof SyntaxError) {
            if (!useRepair) {
                return parseEvaluationFromEntireContent(data, true);
            }
            console.error('Failed to parse JSON:', error);
        } else {
            console.error('Invalid evaluation data:', error);
        }
    }
}

async function getEvaluation(
    apiKey: string,
    model: string,
    providers: string[],
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
                order: providers,
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
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            appearance: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            personality: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            background: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            introduction: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            creativeElements: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            consistency: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                            structure: {
                                type: 'object',
                                properties: {
                                    score: {
                                        type: 'number',
                                    },
                                    reason: {
                                        type: 'string',
                                    },
                                },
                                required: ['score', 'reason'],
                                additionalProperties: false,
                            },
                        },
                        required: ['grammarAndSpelling', 'appearance', 'personality', 'background', 'introduction', 'creativeElements', 'consistency', 'structure'],
                        additionalProperties: false,
                    },
                },
            },
        }),
    });

    const data = await response.json();
    if (data.error) {
        console.error(JSON.parse(data.error.metadata.raw).message);
    }
    const evaluation = (await parseEvaluationFromCodeBlock(data.choices[0].message.content)) || (await parseEvaluationFromEntireContent(data.choices[0].message.content.trim()));

    if (evaluation) {
        return { id: characterId, evaluation };
    }

    if (retry < retryLimit) {
        return await getEvaluation(apiKey, model, providers, characterId, systemPrompt, evaluationText, retryLimit, retry + 1);
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

        let characterDefs = await db
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
                    isNull(ratings.aiIntroductionScore),
                    isNull(ratings.aiCreativeElementsScore),
                    isNull(ratings.aiConsistencyScore),
                    isNull(ratings.aiStructureScore),
                    lte(ratings.aiLastEvaluated, dayjs(runtimeConfig.evaluationLatestVersion).toDate())
                )
            );

        if (payload.force) {
            await db.delete(ratings);
            characterDefs = await db.select().from(characters).leftJoin(definitions, eq(characters.id, definitions.id)).leftJoin(ratings, eq(characters.id, ratings.id));
        } else if (payload.id) {
            characterDefs = await db
                .select()
                .from(characters)
                .leftJoin(definitions, eq(characters.id, definitions.id))
                .leftJoin(ratings, eq(characters.id, ratings.id))
                .where(eq(characters.id, payload.id as number));
        }

        const chunkSize = 15;
        let progress = 0;
        const failedEvaluations: { id: number }[] = [];

        console.log(`Getting evaluations for ${characterDefs.length} characters.`);
        for (let i = 0; i < characterDefs.length; i += chunkSize) {
            const chunk = characterDefs.slice(i, i + chunkSize);

            const chunkPromises = chunk.map(async (characterDef: any) => {
                try {
                    if (!characterDef.definitions?.definition) {
                        throw new Error('Empty definition received.');
                    }

                    const json = JSON.parse(characterDef.definitions.definition);
                    return await getEvaluation(
                        runtimeConfig.openRouterKey,
                        runtimeConfig.openRouterModel,
                        runtimeConfig.openRouterProviders,
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
                    await db
                        .insert(ratings)
                        .values({
                            id: result.id,
                            aiLastEvaluated: dayjs().toDate(),
                            aiGrammarAndSpellingScore: result.evaluation.grammarAndSpelling.score,
                            aiGrammarAndSpellingReason: result.evaluation.grammarAndSpelling.reason,
                            aiAppearanceScore: result.evaluation.appearance.score,
                            aiAppearanceReason: result.evaluation.appearance.reason,
                            aiPersonalityScore: result.evaluation.personality.score,
                            aiPersonalityReason: result.evaluation.personality.reason,
                            aiBackgroundScore: result.evaluation.background.score,
                            aiBackgroundReason: result.evaluation.background.reason,
                            aiIntroductionScore: result.evaluation.introduction.score,
                            aiIntroductionReason: result.evaluation.introduction.reason,
                            aiCreativeElementsScore: result.evaluation.creativeElements.score,
                            aiCreativeElementsReason: result.evaluation.creativeElements.reason,
                            aiConsistencyScore: result.evaluation.consistency.score,
                            aiConsistencyReason: result.evaluation.consistency.reason,
                            aiStructureScore: result.evaluation.structure.score,
                            aiStructureReason: result.evaluation.structure.reason,
                        })
                        .onConflictDoUpdate({
                            target: ratings.id,
                            set: {
                                aiLastEvaluated: dayjs().toDate(),
                                aiGrammarAndSpellingScore: result.evaluation.grammarAndSpelling.score,
                                aiGrammarAndSpellingReason: result.evaluation.grammarAndSpelling.reason,
                                aiAppearanceScore: result.evaluation.appearance.score,
                                aiAppearanceReason: result.evaluation.appearance.reason,
                                aiPersonalityScore: result.evaluation.personality.score,
                                aiPersonalityReason: result.evaluation.personality.reason,
                                aiBackgroundScore: result.evaluation.background.score,
                                aiBackgroundReason: result.evaluation.background.reason,
                                aiIntroductionScore: result.evaluation.introduction.score,
                                aiIntroductionReason: result.evaluation.introduction.reason,
                                aiCreativeElementsScore: result.evaluation.creativeElements.score,
                                aiCreativeElementsReason: result.evaluation.creativeElements.reason,
                                aiConsistencyScore: result.evaluation.consistency.score,
                                aiConsistencyReason: result.evaluation.consistency.reason,
                                aiStructureScore: result.evaluation.structure.score,
                                aiStructureReason: result.evaluation.structure.reason,
                            },
                        });
                } else {
                    failedEvaluations.push({ id: result.id });
                }
            }

            progress += chunkResults.length;
            console.log(`Completed ${progress} out of ${characterDefs.length} total.`);
            await Sleep(500);
        }

        if (failedEvaluations.length > 0) {
            console.warn(
                `Completed rating generation task with ${failedEvaluations.length} failures. The IDs are: ${failedEvaluations.map((evaluation) => evaluation.id).join(', ')}`
            );
        } else {
            console.log('Completed rating generation task...');
        }

        return { result: 'Success' };
    },
});
