import dayjs from 'dayjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';

export default defineNitroPlugin(async (nitroApp) => {
    console.log('Preparing database.');

    const runtimeConfig = useRuntimeConfig();

    const storage = createStorage({
        driver: fsDriver({ base: './cache' }),
    });

    const lastRun = await storage.getItem<number>('startup:timestamp');
    if (lastRun && dayjs(lastRun).add(1, 'hour') > dayjs()) {
        return;
    }

    try {
        if (runtimeConfig.dbMigrate) {
            const { Pool } = pg;
            const pool = new Pool({
                host: runtimeConfig.dbHost,
                user: runtimeConfig.dbUser,
                password: runtimeConfig.dbPassword,
                database: runtimeConfig.dbDatabase,
            });

            const db = drizzle(pool);

            await migrate(db, { migrationsFolder: runtimeConfig.dbMigrations });
        }
    } catch (err: any) {
        console.error(err);
        throw err;
    }

    const p1 = runTask('images:generate', { payload: {} });
    const p2 = runTask('etags:generate', { payload: {} });
    const p3 = runTask('embeddings:generate', { payload: {} });
    const p4 = runTask('definitions:migrate', { payload: {} });
    const p5 = runTask('relations:generate', { payload: {} });
    const p6 = runTask('ratings:generate', { payload: {} });
    await Promise.allSettled([p1, p2, p3, p4, p5, p6]);

    await storage.setItem<number>('startup:timestamp', dayjs().unix());

    console.log('Database ready.');
});
