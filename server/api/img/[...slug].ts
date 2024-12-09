import { GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    const filePath = event.context.params?.slug;

    if (!filePath) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Route parameter is missing',
        });
    }

    const variant = filePath.split('/')[0];
    const imageId = filePath.split('/')[1].replace('.png', '');

    if (!Number(imageId)) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Query parameter "id" is missing or not a number',
        });
    }

    const id = Number(imageId);
    const runtimeConfig = useRuntimeConfig(event);

    if (runtimeConfig.expUseS3ImageStore) {
        const s3client = await ConnectS3(event);
        try {
            const command = new GetObjectCommand({
                Bucket: runtimeConfig.S3Bucket,
                Key: `${variant}/${imageId}.png`,
            });

            const response = await s3client.send(command);
            const imageBuffer = await response.Body?.transformToByteArray();

            if (!imageBuffer) {
                throw new Error('Image not found');
            }

            event.node.res.setHeader('Content-Type', 'image/png');
            event.node.res.write(Buffer.from(imageBuffer));
            event.node.res.end();
        } catch (error) {
            throw createError({
                statusCode: StatusCode.NOT_FOUND,
                statusMessage: 'Image not found',
            });
        }
    }

    try {
        const data = await fs.readFile(path.join(runtimeConfig.imageFolder, variant, `${id}.png`));

        event.node.res.setHeader('Content-Type', 'image/png');
        event.node.res.write(Buffer.from(data));
        event.node.res.end();
    } catch (error) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Image not found',
        });
    }
});
