import { describe, test } from 'vitest';
import { MistralEmbedder, NomicEmbedder, OpenAiEmbedder } from '~/server/utils/Embedder';
import { MistralEmbeddingResult } from '~/tests/MistralEmbeddingResult';
import { NomicEmbeddingResult } from '~/tests/NomicEmbeddingResult';
import { TogetherAiEmbeddingResult } from '~/tests/TogetherAiEmbeddingResult';

const text = 'Hello, world!';

describe('Embedding Providers', { concurrent: true, timeout: 60 * 1000 }, () => {
    test('NomicEmbedder - String', async ({ expect }) => {
        const embedderProvider = new NomicEmbedder(process.env.NOMIC_KEY ?? '');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed(text);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => typeof item === 'number')).toBe(true);
        expect(embeddings.length).toBe(768);
        expect(embeddings).toStrictEqual(NomicEmbeddingResult);
    });

    test('NomicEmbedder - String[]', async ({ expect }) => {
        const embedderProvider = new NomicEmbedder(process.env.NOMIC_KEY ?? '');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed([text]);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => Array.isArray(item))).toBe(true);
        expect((embeddings[0] as any[]).every((item) => typeof item === 'number')).toBe(true);
        expect((embeddings[0] as number[]).length).toBe(768);
        expect(embeddings[0] as number[]).toStrictEqual(NomicEmbeddingResult);
    });

    test('MistralEmbedder - String', async ({ expect }) => {
        const embedderProvider = new MistralEmbedder(process.env.MISTRAL_KEY ?? '');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed(text);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => typeof item === 'number')).toBe(true);
        expect(embeddings.length).toBe(1024);
        expect(embeddings).toStrictEqual(MistralEmbeddingResult);
    });

    test('MistralEmbedder - String[]', async ({ expect }) => {
        const embedderProvider = new MistralEmbedder(process.env.MISTRAL_KEY ?? '');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed([text]);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => Array.isArray(item))).toBe(true);
        expect((embeddings[0] as any[]).every((item) => typeof item === 'number')).toBe(true);
        expect((embeddings[0] as number[]).length).toBe(1024);
        expect(embeddings[0] as number[]).toStrictEqual(MistralEmbeddingResult);
    });

    test('OpenAiEmbedder (Mistral API) - String', async ({ expect }) => {
        const embedderProvider = new OpenAiEmbedder(process.env.MISTRAL_KEY ?? '', 'https://api.mistral.ai/v1/', 'mistral-embed');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed(text);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => typeof item === 'number')).toBe(true);
        expect(embeddings.length).toBe(1024);
        expect(embeddings).toStrictEqual(MistralEmbeddingResult);
    });

    test('OpenAiEmbedder (Mistral API) - String[]', async ({ expect }) => {
        const embedderProvider = new OpenAiEmbedder(process.env.MISTRAL_KEY ?? '', 'https://api.mistral.ai/v1/', 'mistral-embed');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed([text]);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => Array.isArray(item))).toBe(true);
        expect((embeddings[0] as any[]).every((item) => typeof item === 'number')).toBe(true);
        expect((embeddings[0] as number[]).length).toBe(1024);
        expect(embeddings[0] as number[]).toStrictEqual(MistralEmbeddingResult);
    });

    test('OpenAiEmbedder (TogetherAI API) - String', async ({ expect }) => {
        const embedderProvider = new OpenAiEmbedder(process.env.TOGETHER_KEY ?? '', 'https://api.together.xyz/v1/', 'BAAI/bge-large-en-v1.5');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed(text);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => typeof item === 'number')).toBe(true);
        expect(embeddings.length).toBe(1024);
        expect(embeddings).toStrictEqual(TogetherAiEmbeddingResult);
    });

    test('OpenAiEmbedder (TogetherAI API) - String[]', async ({ expect }) => {
        const embedderProvider = new OpenAiEmbedder(process.env.TOGETHER_KEY ?? '', 'https://api.together.xyz/v1/', 'BAAI/bge-large-en-v1.5');
        await embedderProvider.initialize();
        const embeddings = await embedderProvider.embed([text]);

        expect(Array.isArray(embeddings)).toBe(true);
        expect(embeddings.every((item) => Array.isArray(item))).toBe(true);
        expect((embeddings[0] as any[]).every((item) => typeof item === 'number')).toBe(true);
        expect((embeddings[0] as number[]).length).toBe(1024);
        expect(embeddings[0] as number[]).toStrictEqual(TogetherAiEmbeddingResult);
    });
});
