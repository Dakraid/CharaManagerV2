import { desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const { id } = await readBody<{ id: number }>(event);

    const rows = await db
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
        .where(eq(characters.id, id))
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.uploadDate));

    const result = rows[0];
    return {
        id: result.id,
        fileName: result.fileName,
        charName: result.charName ?? '',
        uploadDate: result.uploadDate,
        etag: result.etag ?? '',
        rating: result.rating ?? 0,
        tokensPermanent: result.tokensPermanent ?? 0,
        tokensTotal: result.tokensTotal ?? 0,
    };
});
