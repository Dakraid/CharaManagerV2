export default defineEventHandler(async (event) => {
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const runtimeConfig = useRuntimeConfig(event);
    const userRows = await db.select().from(users);

    if (runtimeConfig.allowRegistration) {
        if (runtimeConfig.singleUserMode) {
            return !(userRows.length > 0);
        }

        return true;
    }

    return false;
});
