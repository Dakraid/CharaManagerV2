import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import Jimp from 'jimp-compact';
import fs from 'node:fs/promises';
import path from 'node:path';
import { estimateBase64ImageSize } from '~/server/utils/Base64Image';

async function processImage(id: number, imageIn: string, sizeLimit: number = 10): Promise<number> {
    console.log(`Processing Image #${id}`);
    const runtimeConfig = useRuntimeConfig();
    const pureImage = await extractImageAsync(imageIn);
    const size = estimateBase64ImageSize(pureImage);

    if (size.megabytes > sizeLimit) {
        console.log(`Image #${id} exceeded the size limit of ${sizeLimit}mb.`);
        return id;
    }

    const buffer = Buffer.from(splitBase64PNG(pureImage), 'base64');
    const image = await Jimp.read(buffer);
    const thumbnail = await image.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

    if (runtimeConfig.expUseS3ImageStore) {
        const s3client = new S3Client({
            region: 'auto',
            endpoint: runtimeConfig.S3Endpoint,
            credentials: {
                accessKeyId: runtimeConfig.S3KeyID,
                secretAccessKey: runtimeConfig.S3KeySecret,
            },
        });

        try {
            await Promise.all([
                s3client.send(
                    new PutObjectCommand({
                        Bucket: runtimeConfig.S3Bucket,
                        Key: `full/${id}.png`,
                        Body: buffer,
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
        await Promise.all([
            fs.writeFile(path.join(runtimeConfig.imageFolder, `/full/${id}.png`), buffer),
            fs.writeFile(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`), thumbnail),
        ]);
    }

    return -1;
}

export { processImage };
