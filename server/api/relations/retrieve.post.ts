export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    return db.select().from(relations);
});
