import { asc, desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedQuery = await getValidatedQuery(event, (query) => queryPageSchema.safeParse(query));
    if (!validatedQuery.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedQuery.error.message,
        });
    }
    const page = validatedQuery.data.page;
    const perPage = validatedQuery.data.perPage;

    const db = event.context.$db;
    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

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
        .limit(perPage)
        .offset((page - 1) * perPage);
});
