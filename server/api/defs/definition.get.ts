import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const query = getQuery(event);
    if (!query.id || !Number(query.id)) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }
    const id = Number(query.id);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    return db.select().from(definitions).where(eq(definitions.id, id));
});
