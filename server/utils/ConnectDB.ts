import { drizzle } from 'drizzle-orm/node-postgres';
import type { H3Event } from 'h3';
import pg from 'pg';

export default async function (event: H3Event) {
    const runtimeConfig = useRuntimeConfig(event);

    const { Pool } = pg;
    const pool = new Pool({
        host: runtimeConfig.dbHost,
        user: runtimeConfig.dbUser,
        password: runtimeConfig.dbPassword,
        database: runtimeConfig.dbDatabase,
    });

    return drizzle({ client: pool });
}
