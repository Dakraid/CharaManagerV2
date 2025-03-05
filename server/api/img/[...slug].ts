import { GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import lruCacheDriver from 'unstorage/drivers/lru-cache';

const imageCache = createStorage({
    driver: lruCacheDriver({
        ttl: 60 * 60 * 1000,
    }),
});

const fsCache = createStorage({
    driver: fsDriver({ base: './image-cache' }),
});

// noinspection JSUnusedGlobalSymbols
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
    const cacheKey = `${variant}/${id}.png`;

    try {
        const cachedImage = await imageCache.getItem<string>(cacheKey);
        if (cachedImage) {
            const imageBuffer = Buffer.from(cachedImage, 'base64');
            event.node.res.setHeader('Content-Type', 'image/png');
            event.node.res.setHeader('Cache-Control', 'public, max-age=3600');
            event.node.res.write(imageBuffer);
            event.node.res.end();
            return;
        }
    } catch (error) {
        // Cache miss, continue to S3 or file system
    }

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

            const base64Image = Buffer.from(imageBuffer).toString('base64');
            await imageCache.setItem(cacheKey, base64Image);

            event.node.res.setHeader('Content-Type', 'image/png');
            event.node.res.setHeader('Cache-Control', 'public, max-age=3600');
            event.node.res.write(Buffer.from(imageBuffer));
            event.node.res.end();
            return;
        } catch (error) {
            throw createError({
                statusCode: StatusCode.NOT_FOUND,
                statusMessage: 'Image not found',
            });
        }
    }

    try {
        let data: Buffer | null;
        try {
            const cachedData = await fsCache.getItem<string>(cacheKey);
            data = cachedData ? Buffer.from(cachedData, 'base64') : null;
        } catch (cacheError) {
            data = await fs.readFile(path.join(runtimeConfig.imageFolder, variant, `${id}.png`));
            const base64Data = data.toString('base64');
            await fsCache.setItem(cacheKey, base64Data);
            await imageCache.setItem(cacheKey, base64Data);
        }

        if (!data) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Image data not found',
            });
        }

        event.node.res.setHeader('Content-Type', 'image/png');
        event.node.res.setHeader('Cache-Control', 'public, max-age=3600');
        event.node.res.write(data);
        event.node.res.end();
    } catch (error) {
        throw createError({
            statusCode: StatusCode.NOT_FOUND,
            statusMessage: 'Image not found',
        });
    }
});
