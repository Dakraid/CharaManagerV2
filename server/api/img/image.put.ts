import { eq } from 'drizzle-orm';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isBase64PNG } from '~/server/utils/Base64Image';

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

    try {
        const runtimeConfig = useRuntimeConfig();
        let pureImage: string;
        if (isBase64PNG(newImage)) {
            pureImage = extractImage(newImage);
        } else {
            pureImage = newImage;
        }
        const buffer = Buffer.from(splitBase64PNG(pureImage), 'base64');
        const image = await Jimp.read(buffer);
        const thumbnail = await image.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

        console.log('Deleting old image for character with ID ' + id);
        await fs.unlink(path.join(runtimeConfig.imageFolder, `/full/${id}.png`));
        await fs.unlink(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`));

        console.log('Saving image for character with ID ' + id);
        await fs.writeFile(path.join(runtimeConfig.imageFolder, `/full/${id}.png`), buffer);
        await fs.writeFile(path.join(runtimeConfig.imageFolder, `/thumb/${id}.png`), thumbnail);

        const hash = createHash('sha256').update(buffer).digest('hex');
        await db.update(characters).set({ etag: hash }).where(eq(characters.id, id));

        return hash;
    } catch (err: any) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
