import { asc, desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const query = getQuery(event);

    return db
        .select({
            id: characters.id,
            fileName: characters.fileName,
            charName: characters.charName,
            uploadDate: characters.uploadDate,
            etag: characters.etag,
            rating: ratings.rating,
            tokensPermanent: definitions.tokensPermanent,
            tokensTotal: definitions.tokensTotal,
        })
        .from(characters)
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.uploadDate))
        .limit(Number(query.perPage))
        .offset((Number(query.page) - 1) * Number(query.perPage));
});
