export default defineEventHandler(async (event) => {
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const userRows = await db.select().from(users);

    return userRows.length;
});
