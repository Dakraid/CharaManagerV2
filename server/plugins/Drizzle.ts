import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

export default defineNitroPlugin((nitroApp) => {
    const { dbHost, dbUser, dbPassword, dbDatabase } = useRuntimeConfig();

    const { Pool } = pg;
    const pool = new Pool({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase,
    });

    const db = drizzle({ client: pool });

    nitroApp.hooks.hook('request', (event: any) => {
        event.context.$db = db;
    });

    nitroApp.hooks.hookOnce('close', async () => {
        await pool.end();
    });
});
