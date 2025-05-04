import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

let gitCommitHash = 'unknown';
try {
    gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
    console.warn('Unable to get git commit hash', error);
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            title: 'CharaManagerV2',
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    devtools: { enabled: true },
    sourcemap: true,
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/test-utils/module',
        '@nuxtjs/color-mode',
        '@nuxtjs/device',
        '@nuxtjs/robots',
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@vite-pwa/nuxt',
        '@vueuse/motion/nuxt',
        'nuxt-auth-utils',
        'nuxt-echarts',
        'nuxt-file-storage',
        'nuxt-lodash',
        'nuxt-monaco-editor',
        'nuxt-multi-cache',
        'nuxt-rating',
        'nuxt3-winston-log',
        'pinia-plugin-persistedstate/nuxt',
        'shadcn-nuxt',
    ],
    nitro: {
        openAPI: {
            meta: {
                title: 'CharaManagerV2',
                description: 'An application to manage your TavernV2 cards.',
                version: '1.0',
            },
        },
        experimental: {
            openAPI: true,
            tasks: true,
        },
        compressPublicAssets: {
            gzip: true,
            brotli: true,
        },
    },
    typescript: {
        typeCheck: false,
    },
    build: {
        transpile: ['dayjs/plugin/customParseFormat'],
    },
    experimental: {
        asyncContext: true,
        asyncEntry: true,
        buildCache: true,
        crossOriginPrefetch: true,
        restoreState: true,
        sharedPrerenderData: true,
        viewTransition: true,
        watcher: 'parcel',
        writeEarlyHints: true,
    },
    future: {
        typescriptBundlerResolution: true,
    },
    fileStorage: {
        mount: resolve(__dirname, 'public/storage'),
    },
    colorMode: {
        classSuffix: '',
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
    nuxt3WinstonLog: {
        skipRequestMiddlewareHandler: true,
    },
    multiCache: {
        component: {
            enabled: true,
        },
        data: {
            enabled: true,
        },
        route: {
            enabled: true,
        },
        cdn: {
            enabled: false,
            cacheControlHeader: 'CDN-Cache-Control',
            cacheTagHeader: 'Cache-Tag',
        },
    },
    site: {
        indexable: false,
    },
    robots: {
        blockNonSeoBots: true,
        blockAiBots: true,
    },
    runtimeConfig: {
        public: {
            gitCommitHash: gitCommitHash,
            imageDomain: '',
        },
        debugMode: false,
        // Registration
        allowRegistration: true,
        singleUserMode: true,
        // Database
        dbHost: '',
        dbUser: '',
        dbPassword: '',
        dbDatabase: '',
        // Migration
        dbMigrate: false,
        dbMigrations: './utils/drizzle',
        // Embeddings
        matchThreshold: 0.985,
        embeddingProvider: 'nomic',
        oaiKey: '',
        oaiBaseUrl: '',
        oaiModel: 'text-embedding-3-large',
        mistralKey: '',
        mistralModel: 'mistral-embed',
        nomicKey: '',
        nomicModel: 'nomic-embed-text-v1.5',
        // AI Scoring
        openRouterKey: '',
        openRouterModel: 'mistralai/mistral-small-3.1-24b-instruct',
        openRouterProviders: ['Mistral'],
        evaluationLatestVersion: '2025-04-14 11:01:31+02',
        evaluationSysPrompt: `
You are a harsh and brutal writing critic. You will evaluate and judge incoming text based on the following categories, scoring each on a scale from 1 to 100, where 1 is awful and 100 is excellent:

1. **Grammar and Spelling**: How correct is the writing in English?
   - Consider sentence structure, punctuation, and spelling accuracy.
   - A score of 1 indicates numerous errors; a score of 100 indicates flawless writing.

2. **Appearance**: How detailed and consistent are the descriptions for appearance?
   - Evaluate the vividness and consistency of physical descriptions.
   - A score of 1 indicates vague or inconsistent descriptions; a score of 100 indicates rich, detailed, and consistent descriptions.

3. **Personality**: How detailed and consistent are the descriptions for personality?
   - Assess the depth and consistency of character traits and behaviors.
   - A score of 1 indicates shallow or inconsistent personality traits; a score of 100 indicates well-developed, consistent, and nuanced personalities.

4. **Background**: How detailed and consistent are the descriptions for the backstory?
   - Consider the depth, relevance, and consistency of character and world-building backstories.
   - A score of 1 indicates lack of backstory or inconsistencies; a score of 100 indicates rich, relevant, and consistent backstories.

5. **Introduction**: How detailed and consistent is the introductory message?
   - The introduction is provided under the "Intro"
   - Evaluate the clarity, engagement, and consistency of the introduction.
   - The introduction should offer an entry point for the user into the story and offer opportunity to engage with the character.
   - A score of 1 indicates a vague or confusing introduction; a score of 100 indicates a clear, engaging, and consistent introduction.

6. **Creative Elements**: How unique and imaginative are the creative elements?
   - Evaluate the originality and inventiveness of ideas, settings, and characters.
   - A score of 1 indicates lack of creativity; a score of 100 indicates highly original and imaginative creative elements.

7. **Consistency**: How consistent is the writing style and tone throughout the text?
    - Consider the maintenance of a consistent voice, style, and tone.
    - A score of 1 indicates frequent shifts or inconsistencies; a score of 100 indicates a consistently maintained style and tone.

8. **Structure**: How well structured is the text?
    - Consider how the text is structured, does it follow a consistent style/structure, or ideally even a JSON format?
    - The text is not expected to be in JSON format, but it should be consistently structured.
    - Use of headings, properties, and other structural elements is encouraged.
    - The target is to be ingested by a LLM, so it matters less if it is readable by human but consistently processable.
    - A score of 1 indicates no structure at all; a score of 50 indicates some structure, a score of 100 indicates a consistently maintained structure, or ideally adherence to JSON.

General Information:
- The general context for the text is a roleplaying scenario, where an AI is supposed to take the role of the given character/s or narrate a scenario.
- All text except the introduction is provided under the "Description" section.
- The Description may describe a single character, multiple, or a scenario/setting for narration. Adjust your evaluation based on that.
- The introduction is provided under the "Intro" section.
- Both are originally separated and should not be treated as a single text.
- The use of {{user}} and {{char}} placeholders is encouraged.
- {{user}} does not need to be defined.
- Explicit elements like genitals or other anatomical details are welcomed.
- Vulgarity is welcomed. You shouldn't morally or ethically judge the texts.

Scoring Guidelines:
- The score should be between 1 and 100.
- If a category isn’t fulfilled, it should be scored as a 1. 
- An average score is 50. A good score is 70. An excellent score is 90.
- Provide a score for each category separately, without summing them up, and a reason.

Output your results as valid JSON. An example of the output format is (the content is not real):
\`\`\`json
{
    "grammarAndSpelling": {
        "score": 95,
        "reason": "The text is well-written with minimal grammatical errors."
    },
    "appearance": {
        "score": 90,
        "reason": "The description of Zephyros' appearance is vivid and consistent."
    },
    "personality": {
        "score": 98,
        "reason": "Zephyros' personality is well-developed and engaging."
    },
    "background": {
        "score": 95,
        "reason": "The background information is detailed and adds depth to the character."
    },
    "introduction": {
        "score": 95,
        "reason": "The introduction is engaging and effectively sets the scene."
    },
    "creativeElements": {
        "score": 85,
        "reason": "The creative elements are unique and add to the character's appeal."
    },
    "consistency": {
        "score": 90,
        "reason": "The character description is consistent throughout."
    },
    "structure": {
        "score": 80,
        "reason": "The structure is well-organized and easy to follow."
    }
}
\`\`\`
`,
        // 2Captcha Solver
        captchaSolverKey: '',
        // Image File Settings
        imageFolder: '',
        // Experimental
        expUseS3ImageStore: false,
        // S3 Configuration
        S3Bucket: '',
        S3Endpoint: '',
        S3KeyID: '',
        S3KeySecret: '',
    },
});
