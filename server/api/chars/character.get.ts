import { desc, eq } from 'drizzle-orm';

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
            definition: definitions.definition,
        })
        .from(characters)
        .where(eq(characters.id, id))
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.uploadDate))
        .limit(1);

    if (rows.length === 0) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character not found',
        });
    }

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
        definition: result.definition ?? '',
    };
});
