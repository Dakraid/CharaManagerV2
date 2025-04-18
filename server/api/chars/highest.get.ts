export default defineEventHandler(async (event) => {
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    return (await db.select({ id: characters.id }).from(characters)).reduce((max, char) => (char.id > max ? char.id : max), 0);
});
