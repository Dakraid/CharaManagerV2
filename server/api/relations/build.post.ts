import {and, asc, cosineDistance, desc, eq, gt, ne, sql} from 'drizzle-orm';
import type {NodePgDatabase} from 'drizzle-orm/node-postgres';

async function findSimilar(db: NodePgDatabase, id: number, threshold: number, embedding: number[] | null) {
    if (embedding === null) {
        return;
    }
    const similarity = sql<number>`1 - (
    ${cosineDistance(definitions.embedding, embedding)}
    )`;
    const result = await db
        .select({id: definitions.id, similarity: similarity})
        .from(definitions)
        .where(and(gt(similarity, threshold), ne(definitions.id, id)))
        .orderBy((t) => desc(t.similarity));

    return result;
}

export default defineEventHandler(async (event) => {
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const runtimeConfig = useRuntimeConfig(event);

    await db.delete(relations);

    const charactersWithDef = await db
        .select({id: characters.id, fileName: characters.fileName, definition: definitions.definition, embedding: definitions.embedding})
        .from(characters)
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .orderBy(desc(characters.id));

    const charRelations: Relation[] = [];

    const promises: { id: number; promise: Promise<any> }[] = [];
    for (const characterWithDef of charactersWithDef) {
        promises.push({
            id: characterWithDef.id,
            promise: findSimilar(db, characterWithDef.id, runtimeConfig.matchThreshold, characterWithDef.embedding),
        });
    }

    const results = await Promise.all(promises.map((item) => item.promise));

    const resultsWithIds = promises.map((item, index) => ({
        id: item.id,
        matches: results[index],
    }));

    const filtered = resultsWithIds
        .filter((x) => x.matches !== undefined && x.matches.length > 0)
        .sort((a, b) => {
            return b.id - a.id;
        });

    const parentIds = new Set<number>();
    const childIds = new Set<number>();
    filtered.forEach((x) => {
        parentIds.add(x.id);
        x.matches.forEach((y: any) => {
            if (parentIds.has(y.id)) {
                return;
            }
            if (childIds.has(x.id)) {
                return;
            }
            charRelations.push({parentId: x.id, childId: y.id});
            childIds.add(y.id);
        });
    });

    if (charRelations.length > 0) {
        await db.insert(relations).values(charRelations);
    }

    return db.$count(relations);
});
