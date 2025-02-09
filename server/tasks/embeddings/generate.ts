import { desc, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { isWithinTokenLimit } from 'gpt-tokenizer';
import pg from 'pg';

export default defineTask({
    meta: {
        name: 'embeddings:generate',
        description: 'Generate missing embeddings',
    },
    async run({ payload, context }) {
        console.log('Running embedding generation task...');
        const runtimeConfig = useRuntimeConfig();

        const { Pool } = pg;
        const pool = new Pool({
            host: runtimeConfig.dbHost,
            user: runtimeConfig.dbUser,
            password: runtimeConfig.dbPassword,
            database: runtimeConfig.dbDatabase,
        });

        const db = drizzle({ client: pool });

        let embeddingProvider: any;
        switch (runtimeConfig.embeddingProvider) {
            case 'openai':
                embeddingProvider = new OpenAiEmbedder(runtimeConfig.oaiKey, runtimeConfig.oaiBaseUrl, runtimeConfig.oaiModel);
                await embeddingProvider.initialize();
                break;
            case 'mistral':
                embeddingProvider = new MistralEmbedder(runtimeConfig.mistralKey, runtimeConfig.mistralModel);
                await embeddingProvider.initialize();
                break;
            case 'nomic':
                embeddingProvider = new NomicEmbedder(runtimeConfig.nomicKey, runtimeConfig.nomicModel);
                await embeddingProvider.initialize();
                break;
            default:
                throw new Error('Invalid embedding provider');
        }

        const missingEmbeddings = await db.select().from(definitions).where(isNull(definitions.embedding)).orderBy(desc(definitions.id));
        console.log('Generating embeddings for ', missingEmbeddings.length, ' definitions...');

        const promises: { id: number; promise: Promise<any> }[] = [];
        for (const missingEmbedding of missingEmbeddings) {
            const json = JSON.parse(missingEmbedding.definition);

            if (!isWithinTokenLimit(json.data.description, 8192)) {
                console.log('Skipping embedding for ', missingEmbedding.id, ' because description is too long...');
                continue;
            }

            promises.push({
                id: missingEmbedding.id,
                promise: embeddingProvider.embed(json.data.description),
            });
        }

        const results = await Promise.all(promises.map((item) => item.promise));

        const embeddingsWithIds = promises.map((item, index) => ({
            id: item.id,
            embedding: results[index],
        }));

        for (const embeddingWithId of embeddingsWithIds) {
            await db.update(definitions).set({ embedding: embeddingWithId.embedding }).where(eq(definitions.id, embeddingWithId.id));
        }

        console.log('Completed embedding generation task...');
        return { result: 'Success' };
    },
});
