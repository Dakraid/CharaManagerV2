import * as Cards from 'character-card-utils';
import dayjs from 'dayjs';
import { eq, isNull, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { encode, isWithinTokenLimit } from 'gpt-tokenizer';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { getTokenCounts, inputImageToCharacter } from '~/server/utils/CharacterUtilities';
import getEmbeddings from '~/server/utils/EmbeddingUtilities';

async function insertMissingDefinition(db: NodePgDatabase, embedderProvider: any, id: number, file: string) {
    try {
        const card = await inputImageToCharacter(file);
        if (card === undefined) {
            throw new Error('Failed to convert image to character card.');
        }

        const tokens = await getTokenCounts(card);
        const embedding = await getEmbeddings(card, embedderProvider);

        const cardJson = JSON.stringify(card);
        const hash = createHash('sha256').update(cardJson).digest('hex');

        await db.insert(definitions).values({
            id: id,
            definition: cardJson,
            hash: hash,
            embedding: embedding,
            tokensTotal: tokens.tokensTotal,
            tokensPermanent: tokens.tokensPermanent,
        });
    } catch (err: any) {
        console.error(err);
    }
}

async function updateTokenCount(db: NodePgDatabase, id: number, definition: string) {
    try {
        const json = JSON.parse(definition);
        const card = Cards.parseToV2(json);
        const tokens = await getTokenCounts(card);
        await db.update(definitions).set({ tokensTotal: tokens.tokensTotal, tokensPermanent: tokens.tokensPermanent }).where(eq(definitions.id, id));
    } catch (err: any) {
        console.error(err);
    }
}

export default defineTask({
    meta: {
        name: 'definitions:migrate',
        description: 'Update definitions if missing data is found.',
    },
    async run({ payload, context }) {
        console.log('Running definition migration task...');
        const runtimeConfig = useRuntimeConfig();

        const { Pool } = pg;
        const pool = new Pool({
            host: runtimeConfig.dbHost,
            user: runtimeConfig.dbUser,
            password: runtimeConfig.dbPassword,
            database: runtimeConfig.dbDatabase,
        });

        const db = drizzle({ client: pool });

        const missingDefs = await db
            .select({
                missingId: characters.id,
                missingFile: characters.file,
            })
            .from(characters)
            .leftJoin(definitions, eq(characters.id, definitions.id))
            .where(isNull(definitions.id));

        if (missingDefs.length > 0) {
            console.log('Inserting ', missingDefs.length, ' missing definitions...');
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

            const defPromises = missingDefs.map((missingDef) => insertMissingDefinition(db, embeddingProvider, missingDef.missingId, missingDef.missingFile));
            await Promise.all(defPromises);
        }

        const targets = await db
            .select()
            .from(definitions)
            .where(or(isNull(definitions.tokensPermanent), isNull(definitions.tokensTotal)));

        if (targets.length > 0) {
            console.log('Updating token counts for ', targets.length, ' definitions...');
            const tokenPromises = targets.map((definition) => updateTokenCount(db, definition.id, definition.definition));
            await Promise.all(tokenPromises);
        }

        console.log('Completed migration task...');
        return { result: 'Success' };
    },
});
