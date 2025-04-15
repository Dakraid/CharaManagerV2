import { GetObjectCommand } from '@aws-sdk/client-s3';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import * as fs from 'node:fs/promises';
import path from 'node:path';

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

    const result = await db
        .select({
            id: characters.id,
            charName: characters.charName,
            uploadDate: characters.uploadDate,
            etag: characters.etag,
            definition: definitions.definition,
        })
        .from(characters)
        .leftJoin(definitions, eq(characters.id, definitions.id))
        .where(eq(characters.id, id));

    if (result.length === 0) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Character not found',
        });
    }

    if (!result[0].definition) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Definition not found',
        });
    }

    const runtimeConfig = useRuntimeConfig();

    if (runtimeConfig.expUseS3ImageStore) {
        const s3client = await ConnectS3(event);
        try {
            const command = new GetObjectCommand({
                Bucket: runtimeConfig.S3Bucket,
                Key: `full/${id}.png`,
            });

            const response = await s3client.send(command);
            const imageBuffer = await response.Body?.transformToByteArray();

            if (!imageBuffer) {
                throw new Error('Image not found');
            }

            const imageBase64 = 'data:image/png;base64,' + Buffer.from(imageBuffer).toString('base64');
            return { card: addDefinition(imageBase64, result[0].definition), name: `${result[0].charName}_${dayjs(result[0].uploadDate).format('YYYY-MM-DD_HH-mm-ss')}.png` };
        } catch (error) {
            throw createError({
                statusCode: StatusCode.NOT_FOUND,
                statusMessage: 'Image not found',
            });
        }
    } else {
        const image = await fs.readFile(path.join(runtimeConfig.imageFolder, `full/${id}.png`));
        const imageBase64 = 'data:image/png;base64,' + Buffer.from(image).toString('base64');

        return { card: addDefinition(imageBase64, result[0].definition), name: `${result[0].charName}_${dayjs(result[0].uploadDate).format('YYYY-MM-DD_HH-mm-ss')}.png` };
    }
});
