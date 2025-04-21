import * as Cards from 'character-card-utils';
import type { V2 } from 'character-card-utils';
import dayjs from 'dayjs';
import sharp from 'sharp';
import { addDefinition, updateDefinition } from '~/server/utils/Base64Image';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedBody = await readValidatedBody(event, (body) => postWyvernUriSchema.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }

    const characterPath = validatedBody.data.targetUri.split('/characters/')[1];
    try {
        const wyvernJson = await $fetch<any>(`https://rapi.wyvern.chat/characters/${characterPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const fileName = 'main_' + wyvernJson.name + '_spec_v2.png';
        const wyvernAvatar = await $fetch(wyvernJson.avatar, {
            method: 'GET',
        });

        let card: Cards.V2;
        try {
            card = Cards.parseToV2(wyvernJson);
        } catch (err: any) {
            throw createError({
                statusCode: StatusCode.BAD_REQUEST,
                statusMessage: 'Failed to parse character definition.',
            });
        }

        if (wyvernAvatar instanceof Blob || wyvernAvatar instanceof File) {
            const buffer = Buffer.from(await wyvernAvatar.arrayBuffer());
            const pngBuffer = await sharp(buffer).png().toBuffer();
            const newCard = addDefinition('data:image/png;base64,' + pngBuffer.toString('base64'), JSON.stringify(card));

            return {
                name: fileName,
                content: newCard,
                lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                sourceUri: validatedBody.data.targetUri,
            } as FileUpload;
        } else {
            throw new Error('Unrecognized file format received.');
        }
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
