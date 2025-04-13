import { GetObjectCommand } from '@aws-sdk/client-s3';
import { def } from '@vue/shared';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import * as fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const query = getQuery(event);
    if (!query.id || !Number(query.id)) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }
    const id = Number(query.id);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const result = await db.select().from(ratings).where(eq(ratings.id, id));

    if (result.length === 0) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character not found',
        });
    }

    return result[0];
});
