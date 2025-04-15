import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedQuery = await getValidatedQuery(event, (query) => queryIdSchema.safeParse(query));
    if (!validatedQuery.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }
    const id = validatedQuery.data.id;

    const db = event.context.$db;
    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const result = await db.select().from(ratings).where(eq(ratings.id, id)).limit(1);

    if (result.length === 0) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character not found',
        });
    }

    return result[0];
});
