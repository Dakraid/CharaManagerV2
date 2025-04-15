import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedQuery = await readValidatedBody(event, (body) => queryIdSchema.safeParse(body));
    if (!validatedQuery.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }
    const id = validatedQuery.data.number;

    const db = event.context.$db;
    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    try {
        const runtimeConfig = useRuntimeConfig(event);
        if (runtimeConfig.expUseS3ImageStore) {
            const s3client = await ConnectS3(event);

            try {
                const command = new DeleteObjectCommand({
                    Bucket: runtimeConfig.S3Bucket,
                    Key: `full/${id}.png`,
                });

                await s3client.send(command);
            } catch (err: any) {
                console.error(err);
            }

            try {
                const command = new DeleteObjectCommand({
                    Bucket: runtimeConfig.S3Bucket,
                    Key: `thumb/${id}.png`,
                });

                await s3client.send(command);
            } catch (err: any) {
                console.error(err);
            }
        } else {
            await fs.unlink(path.join(runtimeConfig.imageFolder, `/full/${id}.png`));
            await fs.unlink(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`));
        }
    } catch (err: any) {
        console.error(err);
    }

    try {
        await db.delete(definitionHistory).where(eq(definitionHistory.definitionId, id));
        await db.delete(definitions).where(eq(definitions.id, id));
        await db.delete(ratings).where(eq(ratings.id, id));
        await db.delete(characters).where(eq(characters.id, id));
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }

    return 'Successfully deleted character.';
});
