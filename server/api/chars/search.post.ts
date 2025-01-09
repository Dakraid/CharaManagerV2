import dayjs from 'dayjs';
import type { SQL } from 'drizzle-orm';
import { eq, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';
import { ComparisonOperator } from '~/utils/Search';

function withName(operator: ComparisonOperator, query: string) {
    switch (operator) {
        case ComparisonOperator.Equal:
            return sql`${characters.charName} =
            ${query}`;
        case ComparisonOperator.NotEqual:
            return sql`${characters.charName} !=
            ${query}`;
        case ComparisonOperator.Unlike:
            return sql`${characters.charName} NOT ILIKE
            ${'%' + query + '%'}`;
        case ComparisonOperator.Like:
            return sql`${characters.charName} ILIKE
            ${'%' + query + '%'}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withId(operator: ComparisonOperator, from: number, to?: number) {
    switch (operator) {
        case ComparisonOperator.Equal:
            return sql`${characters.id} =
            ${from}`;
        case ComparisonOperator.NotEqual:
            return sql`${characters.id} !=
            ${from}`;
        case ComparisonOperator.Greater:
            return sql`${characters.id} >
            ${from}`;
        case ComparisonOperator.GreaterOrEqual:
            return sql`${characters.id} >=
            ${from}`;
        case ComparisonOperator.Less:
            return sql`${characters.id} <
            ${from}`;
        case ComparisonOperator.LessOrEqual:
            return sql`${characters.id} <=
            ${from}`;
        case ComparisonOperator.Between:
            if (!to) {
                throw createError({
                    statusCode: StatusCode.BAD_REQUEST,
                    statusMessage: 'Requested range operator but did not supply end query.',
                });
            }

            return sql`${characters.id} >=
            ${from}
            AND
            ${characters.id}
            <=
            ${to}`;
        case ComparisonOperator.Outside:
            if (!to) {
                throw createError({
                    statusCode: StatusCode.BAD_REQUEST,
                    statusMessage: 'Requested range operator but did not supply end query.',
                });
            }

            return sql`${characters.id} <=
            ${from}
            AND
            ${characters.id}
            >=
            ${to}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withDescription(operator: ComparisonOperator, query: string, embedding?: number[], threshold?: number) {
    switch (operator) {
        case ComparisonOperator.Equal:
            return sql`${characters.id} =
            ${query}`;
        case ComparisonOperator.NotEqual:
            return sql`${characters.id} !=
            ${query}`;
        case ComparisonOperator.Unlike:
            return sql`${characters.id} NOT ILIKE
            ${'%' + query + '%'}`;
        case ComparisonOperator.Like:
            return sql`${characters.id} ILIKE
            ${'%' + query + '%'}`;
        case ComparisonOperator.Cosine:
            if (!embedding || !threshold) {
                throw createError({
                    statusCode: StatusCode.BAD_REQUEST,
                    statusMessage: 'Requested cosine operator but did not receive an embedding or threshold.',
                });
            }

            return sql`(1 -
            ${definitions.embedding}
            <=>
            ${embedding}
            )
            >
            ${threshold}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withFilename(operator: ComparisonOperator, query: string) {
    switch (operator) {
        case ComparisonOperator.Equal:
            return sql`${characters.fileName} =
            ${query}`;
        case ComparisonOperator.NotEqual:
            return sql`${characters.fileName} !=
            ${query}`;
        case ComparisonOperator.Unlike:
            return sql`${characters.fileName} NOT ILIKE
            ${'%' + query + '%'}`;
        case ComparisonOperator.Like:
            return sql`${characters.fileName} ILIKE
            ${'%' + query + '%'}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

function withDate(operator: ComparisonOperator, from: number, to?: number) {
    switch (operator) {
        case ComparisonOperator.Equal:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') =
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.NotEqual:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') !=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.Greater:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') >
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.GreaterOrEqual:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') >=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.Less:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') <
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.LessOrEqual:
            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') <=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.Between:
            if (!to) {
                throw createError({
                    statusCode: StatusCode.BAD_REQUEST,
                    statusMessage: 'Requested range operator but did not supply end query.',
                });
            }

            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') >=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}
            AND
            date_trunc('day', TIMESTAMP '${characters.uploadDate}') <=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        case ComparisonOperator.Outside:
            if (!to) {
                throw createError({
                    statusCode: StatusCode.BAD_REQUEST,
                    statusMessage: 'Requested range operator but did not supply end query.',
                });
            }

            return sql`date_trunc('day', TIMESTAMP '${characters.uploadDate}') <=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}
            AND
            date_trunc('day', TIMESTAMP '${characters.uploadDate}') >=
            ${dayjs(from).format('YYYY-MM-DD [00:00:00]')}`;
        default:
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Invalid operator',
            });
    }
}

// function withRating(rating: number, operator: string) {
//     switch (operator) {
//         case '=':
//             return sql`${ratings.rating} =
//             ${rating}`;
//         case '>':
//             return sql`${ratings.rating} >
//             ${rating}`;
//         case '<':
//             return sql`${ratings.rating} <
//             ${rating}`;
//         case '>=':
//             return sql`${ratings.rating} >=
//             ${rating}`;
//         case '<=':
//             return sql`${ratings.rating} <=
//             ${rating}`;
//         default:
//             throw createError({
//                 statusCode: StatusCode.BAD_REQUEST,
//                 statusMessage: 'Invalid operator',
//             });
//     }
// }

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

    const { page, perPage, searchFlags } = await readBody<{ page: number; perPage: number; searchFlags: SearchFlags }>(event);

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

    if (searchFlags.name.query && searchFlags.name.query.trim() != '' && searchFlags.name.option !== ComparisonOperator.Disabled) {
        sqlChunks.push(withName(searchFlags.name.option, searchFlags.name.query));
    }

    if (searchFlags.id.from && searchFlags.id.from != 0 && searchFlags.id.option !== ComparisonOperator.Disabled) {
        sqlChunks.push(withId(searchFlags.id.option, searchFlags.id.from, searchFlags.id.to));
    }

    if (searchFlags.desc.query && searchFlags.desc.query.trim() != '' && searchFlags.desc.option !== ComparisonOperator.Disabled) {
        if (searchFlags.desc.option == ComparisonOperator.Cosine) {
            const embedding = await embedderProvider.embed(searchFlags.desc.query);
            sqlChunks.push(withDescription(searchFlags.desc.option, searchFlags.desc.query, embedding, searchFlags.desc.threshold));
        } else {
            sqlChunks.push(withDescription(searchFlags.desc.option, searchFlags.desc.query));
        }
    }

    if (searchFlags.fileName.query && searchFlags.fileName.query.trim() != '' && searchFlags.fileName.option !== ComparisonOperator.Disabled) {
        sqlChunks.push(withFilename(searchFlags.fileName.option, searchFlags.fileName.query));
    }

    if (searchFlags.uploadDate.from && searchFlags.uploadDate.from != 0 && searchFlags.uploadDate.option !== ComparisonOperator.Disabled) {
        sqlChunks.push(withDate(searchFlags.uploadDate.option, searchFlags.uploadDate.from, searchFlags.uploadDate.to));
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
