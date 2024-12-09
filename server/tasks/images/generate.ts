import type { _Object } from '@aws-sdk/client-s3';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { gte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { access, constants, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

async function VerifyFolder(folder: string) {
    try {
        await access(folder, constants.F_OK);
    } catch {
        try {
            await mkdir(folder, { recursive: true });
        } catch (err: any) {
            console.error(err);
        }
    }
}

async function GetHighestIdInFolder(folder: string): Promise<number> {
    let highest: number = 0;
    const files = await readdir(folder);
    try {
        for (const file in files) {
            const fileId = Number(file.replace('.png', ''));
            if (fileId > highest) {
                highest = fileId;
            }
        }
    } catch (err) {
        console.error(err);
    }

    return highest;
}

async function GetHighestIdInBucket(objects: _Object[]): Promise<number> {
    let highestId = 0;

    objects.forEach((obj) => {
        const match = obj.Key?.match(/\/(\d+)\.png$/);
        if (match) {
            const id = parseInt(match[1]);
            if (id > highestId) {
                highestId = id;
            }
        }
    });

    return highestId;
}

export default defineTask({
    meta: {
        name: 'images:generate',
        description: 'Generate missing images',
    },
    async run({ payload, context }) {
        console.log('Running image generation task...');
        const runtimeConfig = useRuntimeConfig();

        const { Pool } = pg;
        const pool = new Pool({
            host: runtimeConfig.dbHost,
            user: runtimeConfig.dbUser,
            password: runtimeConfig.dbPassword,
            database: runtimeConfig.dbDatabase,
        });

        const db = drizzle({ client: pool });

        let highestNumbers: [number, number];
        if (runtimeConfig.expUseS3ImageStore) {
            const s3client = new S3Client({
                region: 'auto',
                endpoint: runtimeConfig.S3Endpoint,
                credentials: {
                    accessKeyId: runtimeConfig.S3KeyID,
                    secretAccessKey: runtimeConfig.S3KeySecret,
                },
            });

            const bucket = await s3client.send(new ListObjectsV2Command({ Bucket: runtimeConfig.S3Bucket }));
            let allObjects = bucket.Contents || [];
            let nextToken = bucket.NextContinuationToken;

            while (nextToken) {
                const nextBatch = await s3client.send(
                    new ListObjectsV2Command({
                        Bucket: runtimeConfig.S3Bucket,
                        ContinuationToken: nextToken,
                    })
                );
                allObjects = [...allObjects, ...(nextBatch.Contents || [])];
                nextToken = nextBatch.NextContinuationToken;
            }

            const fullImages = allObjects.filter((obj) => obj.Key?.startsWith('full/')) || [];
            const thumbImages = allObjects.filter((obj) => obj.Key?.startsWith('thumb/')) || [];

            highestNumbers = await Promise.all([GetHighestIdInBucket(fullImages), GetHighestIdInBucket(thumbImages)]);
        } else {
            // Verify that the folders exist on disk, otherwise create them. Executed in parallel for full and thumb images.
            await Promise.all([VerifyFolder(path.join(runtimeConfig.imageFolder, '/full')), VerifyFolder(path.join(runtimeConfig.imageFolder, '/thumb'))]);

            // As images are saved using their ID, we check what the highest ID in each folder is.
            highestNumbers = await Promise.all([
                GetHighestIdInFolder(path.join(runtimeConfig.imageFolder, '/full')),
                GetHighestIdInFolder(path.join(runtimeConfig.imageFolder, '/thumb')),
            ]);
        }

        // We pick the lowest number between the two highest numbers and regenerate all images beyond that ID.
        const lowestNumber = highestNumbers.length > 0 ? Math.min(...highestNumbers) : 0;
        const missingImages = await db.select().from(characters).where(gte(characters.id, lowestNumber));
        console.log('Generating images for ', missingImages.length, ' characters...');

        // In case we have a lot of images to regenerate, we split them into chunks to avoid OOM errors.
        const chunkSize = 50;
        const skippedImages: number[] = [];
        const returns: number[] = [];
        if (missingImages.length > chunkSize) {
            console.log('Too many images to generate, splitting into chunks...');
            for (let i = 0; i < missingImages.length; i += chunkSize) {
                const promises = missingImages.slice(i, i + chunkSize).map((image) => processImage(image.id, image.file));
                returns.push(...(await Promise.all(promises)));
            }
        } else {
            const promises = missingImages.map((image) => processImage(image.id, image.file));
            returns.push(...(await Promise.all(promises)));
        }

        skippedImages.push(...returns.filter((id: number) => id !== -1));
        if (skippedImages.length > 0) {
            console.log('Several large images found, generating individually...');
            for (const id of skippedImages) {
                const imageFile = missingImages.find((image) => image.id === id)?.file;
                if (imageFile) {
                    await processImage(id, imageFile, 20);
                }
            }
        }

        console.log('Completed image generation task...');
        return { result: 'Success' };
    },
});
