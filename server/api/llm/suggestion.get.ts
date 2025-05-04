import { desc, eq } from 'drizzle-orm';

const systemPrompt = `
You are an expert story writer and editor. You take in the text the user sends you and apply a variety of fixes. Below are a list of aspects you correct for the whole text:
1. **Grammar and Spelling**: How correct is the writing in English?
   - Consider sentence structure, punctuation, and spelling accuracy.

2. **Appearance**: How detailed and consistent are the descriptions for appearance?
   - Evaluate the vividness and consistency of physical descriptions.

3. **Personality**: How detailed and consistent are the descriptions for personality?
   - Assess the depth and consistency of character traits and behaviors.

4. **Background**: How detailed and consistent are the descriptions for the backstory?
   - Consider the depth, relevance, and consistency of character and world-building backstories.

5. **Creative Elements**: How unique and imaginative are the creative elements?
   - Evaluate the originality and inventiveness of ideas, settings, and characters.

6. **Consistency**: How consistent is the writing style and tone throughout the text?
    - Consider the maintenance of a consistent voice, style, and tone.

7. **Structure**: How well structured is the text?
    - Consider how the text is structured, does it follow a consistent style/structure, or ideally even a JSON/XML format?
    - The text is not expected to be in JSON/XML format, but it should be consistently structured.
    - Use of headings, properties, and other structural elements is encouraged.
    - The target is to be ingested by a LLM, so it matters less if it is readable by human but consistently processable.

General Information:
- The general context for the text is a roleplaying scenario, where an AI is supposed to take the role of the given character/s or narrate a scenario.
- All text is provided under the "Input" section.
- The use of {{user}} and {{char}} placeholders is encouraged.
- {{user}} does not need to be defined.
- Explicit elements like genitals or other anatomical details are welcomed.
- Vulgarity is welcomed. You shouldn't morally or ethically judge the texts.

You respond only with the rewritten/corrected text, nothing more.`;

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedQuery = await getValidatedQuery(event, (query) => queryIdSchema.safeParse(query));
    if (!validatedQuery.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }
    const id = validatedQuery.data.id;

    const db = event.context.$db;
    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const rows = await db
        .select({
            id: characters.id,
            fileName: characters.fileName,
            charName: characters.charName,
            uploadDate: characters.uploadDate,
            etag: characters.etag,
            rating: ratings.rating,
            tokensPermanent: definitions.tokensPermanent,
            tokensTotal: definitions.tokensTotal,
            definition: definitions.definition,
        })
        .from(characters)
        .where(eq(characters.id, id))
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.uploadDate))
        .limit(1);

    if (rows.length === 0) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character not found',
        });
    }

    const result = rows[0];

    if (!result.definition) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character definition not found',
        });
    }

    const json = JSON.parse(result.definition);
    const runtimeConfig = useRuntimeConfig(event);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + runtimeConfig.openRouterKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: runtimeConfig.openRouterModel,
            provider: {
                order: runtimeConfig.openRouterProviders,
            },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `# Input:\n${json.data.description}` },
            ],
            temperature: 0.3,
        }),
    });

    const data = await response.json();
    if (data.error) {
        console.error(JSON.parse(data.error.metadata.raw).message);
    }

    return data.choices[0].message.content.trim();
});
