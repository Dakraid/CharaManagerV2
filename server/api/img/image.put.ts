import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// noinspection JSUnusedGlobalSymbols
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

        const pngBuffer = await sharp(buffer).png().toBuffer();
        const thumbnail = await sharp(buffer).resize({ height: 384, withoutEnlargement: true }).png().toBuffer();

        const deleteFiles = async (isS3: boolean) => {
            if (isS3) {
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
            } else {
                try {
                    await Promise.all([
                        fs.unlink(path.join(runtimeConfig.imageFolder, `/full/${id}.png`)).catch(() => console.log(`Full image for #${id} not found on disk.`)),
                        fs.unlink(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`)).catch(() => console.log(`Thumbnail for #${id} not found on disk.`)),
                    ]);
                } catch (err: any) {
                    console.log(`Images for #${id} could not deleted from disk.`);
                    console.error(err);
                }
            }
        };

        const saveFiles = async (isS3: boolean) => {
            if (isS3) {
                const s3client = await ConnectS3(event);
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
                    await fs.mkdir(path.join(runtimeConfig.imageFolder, '/full'), { recursive: true });
                    await fs.mkdir(path.join(runtimeConfig.imageFolder, '/thumb'), { recursive: true });

                    await Promise.all([
                        fs.writeFile(path.join(runtimeConfig.imageFolder, `/full/${id}.png`), pngBuffer),
                        fs.writeFile(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`), thumbnail),
                    ]);
                } catch (err: any) {
                    console.log(`Images for #${id} could not be saved to disk.`);
                    console.error(err);
                }
            }
        };

        await deleteFiles(runtimeConfig.expUseS3ImageStore);
        await saveFiles(runtimeConfig.expUseS3ImageStore);
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
