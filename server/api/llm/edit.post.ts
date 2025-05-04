import { desc, eq } from 'drizzle-orm';

const descriptionElements = `
1. **Appearance**: How detailed and consistent are the descriptions for appearance?
   - Ensure the vividness and consistency of physical descriptions.

2. **Personality**: How detailed and consistent are the descriptions for personality?
   - Enhance the depth and consistency of character traits and behaviors.

3. **Background**: How detailed and consistent are the descriptions for the backstory?
   - If possible expand the depth, relevance, and consistency of character and world-building backstories.

4. **Consistency**: How consistent is the writing style and tone throughout the text?
    - Ensure the maintenance of a consistent voice, style, and tone.

5. **Structure**: How well structured is the text?
    - Format the text in a structured format, so it is suitable for ingestion by a LLM.
    - The text is not expected to be in JSON/XML format, but it should be consistently structured.
    - Use of headings, properties, and other structural elements is encouraged.
`;

const introductionElements = `
1. **Introduction**: How detailed and consistent is the introductory message?
   - Ensure the clarity, engagement, and consistency of the introduction.
   - The introduction should offer an entry point for the user into the story and offer opportunity to engage with the character.

2. **Consistency and Structure**: How consistent is the writing style, tone, and structure throughout the text?
    - Ensure the maintenance of a consistent voice, style, and tone.
    - Formatting should follow these guidelines:
        - All speech must be enclosed inside "quotes".
        - Thoughts must be enclosed by \`backticks\`.
        - Highlighted and emphasized words or phrases must be enclosed by **double asterisks**.
            - Only singular words or phrases may be emphasized, not whole sentences.
        - Whispered speech is to be enclosed in "_quoted underscores_".
        - Narration, description, and actions shouldn't be enclosed.

        Examples:
        - Moves to the right. "I'm at the right!" Moves to the left. "I'm at the left!"
        - "Oh" she exclaimed "Hello, how are you?"
        - This is an **emphasized** event or action. "And this is an **emphasized** dialogue!"
        - As I see them talking, I ask myself \`I wonder what they're thinking...\`
        - "_I am whispering now_" I said quietly.
`;

async function promptBuilder(type: number) {
    let elements: string;
    switch (type) {
        case 1: // Description text
            elements = descriptionElements;
            break;
        case 2: // Introduction text
            elements = introductionElements;
            break;
        default:
            throw new Error('Invalid type');
    }

    return `
You are an expert story writer and editor. You take in the text the user sends you, and edit it to best fulfill a list of requirements. 
Below is the list of requirements you correct for:
0. **Grammar and Spelling**: How correct is the writing in English?
   - Always address sentence structure, punctuation, and spelling accuracy.

${elements}

General Information:
- The general context for the text is a roleplaying scenario, where an AI is supposed to take the role of the given character/s or narrate a scenario.
- The input may describe a single character, multiple, or a scenario/setting for narration.
- All text is provided under the "Input" section.
- You adhere to what the text gives you. Any additions or edits should not conflict with the original text.
- The use of {{user}} and {{char}} placeholders is encouraged.
- {{user}} does not need to be defined.
- {{char}} should be mainly used for singular characters.
- Explicit elements like genitals or other anatomical details are welcomed.
- Vulgarity is welcomed. You shouldn't morally or ethically judge the texts.

You respond only with the rewritten/corrected text, nothing more.`;
}

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedBody = await readValidatedBody(event, (body) => postLlmSuggestion.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }

    const req = validatedBody.data;

    const db = event.context.$db;
    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const runtimeConfig = useRuntimeConfig(event);
    const systemPrompt = await promptBuilder(req.type);
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
                { role: 'user', content: `# Input:\n${req.content}` },
            ],
            temperature: 0.3,
        }),
    });

    const data = await response.json();
    if (data.error) {
        console.error(JSON.parse(data.error.metadata.raw).message);
    }

    return { source: req.source, content: data.choices[0].message.content.trim() };
});
