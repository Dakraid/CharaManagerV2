import { desc, eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const validatedBody = await readValidatedBody(event, (body) => postIdArraySchema.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }
    const ids = validatedBody.data.ids;

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
        .where(inArray(characters.id, ids))
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.uploadDate))
        .limit(30);

    const returnCharacters: Character[] = [];

    for (const result of rows) {
        returnCharacters.push({
            id: result.id,
            fileName: result.fileName,
            charName: result.charName ?? '',
            uploadDate: result.uploadDate,
            etag: result.etag ?? '',
            rating: result.rating ?? 0,
            tokensPermanent: result.tokensPermanent ?? 0,
            tokensTotal: result.tokensTotal ?? 0,
        });
    }

    return returnCharacters;
});
