import * as Cards from 'character-card-utils';
import { eq, isNull, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { encode } from 'gpt-tokenizer';
import pg from 'pg';

async function migrateDefinition(db: NodePgDatabase, id: number, definition: string) {
    try {
        const json = JSON.parse(definition);
        const card = Cards.parseToV2(json);
        const permanent = [card.data.description, card.data.personality];
        const total = [card.data.description, card.data.personality, card.data.first_mes];
        const tokensPermanent = encode(permanent.join('\n')).length;
        const tokensTotal = encode(total.join('\n')).length;
        await db.update(definitions).set({ tokensTotal: tokensTotal, tokensPermanent: tokensPermanent }).where(eq(definitions.id, id));
    } catch (err: any) {
        console.error(err);
    }
}

export default defineTask({
    meta: {
        name: 'definitions:migrate',
        description: 'Update definitions between schema changes',
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

        const targets = await db
            .select()
            .from(definitions)
            .where(or(isNull(definitions.tokensPermanent), isNull(definitions.tokensTotal)));
        console.log('Migrating ', targets.length, ' definitions...');

        const promises = targets.map((definition) => migrateDefinition(db, definition.id, definition.definition));
        await Promise.all(promises);

        console.log('Completed migration task...');
        return { result: 'Success' };
    },
});
