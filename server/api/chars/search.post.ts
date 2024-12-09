import { Embedder } from '@nomic-ai/atlas';
import type { SQL } from 'drizzle-orm';
import { eq, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';
import { PgDialect } from 'drizzle-orm/pg-core';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';

function withId(id: number, operator: string) {
    switch (operator) {
        case '=':
            return sql`${characters.id} =
            ${id}`;
        case '>':
            return sql`${characters.id} >
            ${id}`;
        case '<':
            return sql`${characters.id} <
            ${id}`;
        case '>=':
            return sql`${characters.id} >=
            ${id}`;
        case '<=':
            return sql`${characters.id} <=
            ${id}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withRating(rating: number, operator: string) {
    switch (operator) {
        case '=':
            return sql`${ratings.rating} =
            ${rating}`;
        case '>':
            return sql`${ratings.rating} >
            ${rating}`;
        case '<':
            return sql`${ratings.rating} <
            ${rating}`;
        case '>=':
            return sql`${ratings.rating} >=
            ${rating}`;
        case '<=':
            return sql`${ratings.rating} <=
            ${rating}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withName(search: string) {
    return sql`${characters.charName} ILIKE
    ${'%' + search + '%'}`;
}

function withDescription(embedding: number[]) {
    return sql`(1 -
    ${definitions.embedding}
    <=>
    ${embedding}
    )
    >
    0.9`;
}

function withLimit<T extends PgSelect>(qb: T, page: number, perPage: number) {
    return qb.limit(Number(perPage)).offset((Number(page) - 1) * Number(perPage));
}

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const embedderProvider = event.context.$embedder;
    if (!embedderProvider) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Embedder not initialized',
        });
    }

    const { page, perPage, search } = await readBody<{ page: number; perPage: number; search: string }>(event);

    let query = db
        .select({
            id: characters.id,
            fileName: characters.fileName,
            charName: characters.charName,
            uploadDate: characters.uploadDate,
            etag: characters.etag,
            rating: ratings.rating,
        })
        .from(characters)
        .leftJoin(ratings, eq(characters.id, ratings.id))
        .leftJoin(definitions, eq(definitions.id, ratings.id))
        .$dynamic();

    const sqlChunks: SQL[] = [];
    const regex = /(\w+):([<>=])(\d*)|(\w+):(\d*)|(\w+):"(.*)"|(\w+)/gm;
    let match;
    while ((match = regex.exec(search)) !== null) {
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const [fullMatch, group1, operator, number1, group4, number2, group6, quotedValue, group8] = match;

        if (group1 && operator && number1) {
            if (group1 === 'id') {
                sqlChunks.push(withId(Number(number1), operator));
            } else if (group1 === 'rating') {
                sqlChunks.push(withRating(Number(number1), operator));
            }
        } else if (group4 && number2) {
            if (group4 === 'id') {
                sqlChunks.push(withId(Number(number2), '='));
            }
            if (group4 === 'rating') {
                sqlChunks.push(withRating(Number(number2), '='));
            }
        } else if (group6 && quotedValue) {
            const embedding = await embedderProvider.embed(search);
            sqlChunks.push(withDescription(embedding));
        } else if (group8) {
            sqlChunks.push(withName(group8));
        }
    }

    if (sqlChunks.length > 1) {
        const finalWhere: SQL = sql.join(sqlChunks, sql` AND `);
        query.where(finalWhere);
    } else if (sqlChunks.length === 1) {
        const finalWhere: SQL = sql.join(sqlChunks);
        query.where(finalWhere);
    }
    query = withLimit(query, page, perPage);

    return await query.execute();
});
