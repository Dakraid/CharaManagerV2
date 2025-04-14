export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const rating = await readBody<Rating>(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    try {
        await db
            .insert(ratings)
            .values({ id: rating.id, rating: rating.rating })
            .onConflictDoUpdate({
                target: ratings.id,
                set: { rating: rating.rating },
            });
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }

    return rating.rating;
});
