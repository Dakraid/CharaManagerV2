import { eq, isNull, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createHash } from 'node:crypto';
import pg from 'pg';

async function generateETag(db: NodePgDatabase, id: number, imageIn: string) {
    try {
        const pureImage = extractImage(imageIn);
        const buffer = Buffer.from(splitBase64PNG(pureImage), 'base64');
        const hash = createHash('sha256').update(buffer).digest('hex');
        await db.update(characters).set({ etag: hash }).where(eq(characters.id, id));
    } catch (err: any) {
        console.error(err);
    }
}

export default defineTask({
    meta: {
        name: 'tags:generate',
        description: 'Generate missing etags',
    },
    async run({ payload, context }) {
        console.log('Running etag generation task...');
        const runtimeConfig = useRuntimeConfig();

        const { Pool } = pg;
        const pool = new Pool({
            host: runtimeConfig.dbHost,
            user: runtimeConfig.dbUser,
            password: runtimeConfig.dbPassword,
            database: runtimeConfig.dbDatabase,
        });

        const db = drizzle({ client: pool });

        const missingETags = await db
            .select()
            .from(characters)
            .where(or(isNull(characters.etag), eq(characters.etag, 'NULL')));
        console.log('Generating etags for ', missingETags.length, ' characters...');

        const promises = missingETags.map((image) => generateETag(db, image.id, image.file));
        await Promise.all(promises);

        console.log('Completed etag generation task...');
        return { result: 'Success' };
    },
});
