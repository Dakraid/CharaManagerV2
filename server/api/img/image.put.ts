import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const { id, newImage } = await readBody<{ id: number; newImage: string }>(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const runtimeConfig = useRuntimeConfig();
    try {
        let pureImage: string;
        if (isBase64PNG(newImage)) {
            pureImage = extractImage(newImage);
        } else {
            pureImage = newImage;
        }

        if (pureImage.includes('base64')) {
            pureImage = splitBase64(pureImage);
        }

        const buffer = Buffer.from(pureImage, 'base64');
        const image = await Jimp.read(buffer);
        const pngBuffer = image.getBufferAsync(Jimp.MIME_PNG);
        const thumbnail = await image.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

        if (runtimeConfig.expUseS3ImageStore) {
            const s3client = await ConnectS3(event);

            try {
                await Promise.all([
                    s3client.send(
                        new DeleteObjectCommand({
                            Bucket: runtimeConfig.S3Bucket,
                            Key: `full/${id}.png`,
                        })
                    ),
                    s3client.send(
                        new DeleteObjectCommand({
                            Bucket: runtimeConfig.S3Bucket,
                            Key: `thumb/${id}.png`,
                        })
                    ),
                ]);
            } catch (err: any) {
                console.log(`Images for #${id} could not deleted from S3.`);
                console.error(err);
            }

            try {
                await Promise.all([
                    s3client.send(
                        new PutObjectCommand({
                            Bucket: runtimeConfig.S3Bucket,
                            Key: `full/${id}.png`,
                            Body: pngBuffer,
                            ContentType: 'image/png',
                        })
                    ),
                    s3client.send(
                        new PutObjectCommand({
                            Bucket: runtimeConfig.S3Bucket,
                            Key: `thumb/${id}.png`,
                            Body: thumbnail,
                            ContentType: 'image/png',
                        })
                    ),
                ]);
            } catch (err: any) {
                console.log(`Image #${id} could not be uploaded to S3.`);
                console.error(err);
            }
        } else {
            try {
                await Promise.all([fs.unlink(path.join(runtimeConfig.imageFolder, `/full/${id}.png`)), fs.unlink(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`))]);
            } catch (err: any) {
                console.log(`Images for #${id} could not deleted from disk.`);
                console.error(err);
            }

            try {
                await Promise.all([
                    fs.writeFile(path.join(runtimeConfig.imageFolder, `/full/${id}.png`), pngBuffer),
                    fs.writeFile(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`), thumbnail),
                ]);
            } catch (err: any) {
                console.log(`Images for #${id} could not be saved to disk.`);
                console.error(err);
            }
        }

        const hash = createHash('sha256').update(pngBuffer).digest('hex');
        await db.update(characters).set({ etag: hash }).where(eq(characters.id, id));

        return hash;
    } catch (err: any) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
