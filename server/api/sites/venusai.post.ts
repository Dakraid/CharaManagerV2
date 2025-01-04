import dayjs from "dayjs";
import {writeFile} from "node:fs/promises";
import Jimp from "jimp-compact";

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const {targetUri} = await readBody<{ targetUri: string }>(event);

    const baseUrl = targetUri.split('/characters/')[0];
    const characterPath = targetUri.split('/characters/')[1];
    const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';

    if (!baseUrl.includes('chub.ai') && !baseUrl.includes('characterhub.org')) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: 'Unsupported URL received: ' + targetUri,
        });
    }

    let apiResponse: any;
    try {
        apiResponse = await $fetch('https://api.chub.ai/api/characters/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullPath: characterPath,
                format: 'tavern',
                version: 'main',
            }),
        });

        if (apiResponse instanceof Blob || apiResponse instanceof File) {
            const buffer = Buffer.from(await apiResponse.arrayBuffer());
            return <FileUpload>{
                name: fileName,
                content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64'),
                lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                sourceUri: targetUri,
            };
        } else {
            const response = await fetch('https://api.chub.ai/api/characters/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullPath: characterPath,
                    format: 'tavern',
                    version: 'main',
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            return <FileUpload>{
                name: fileName,
                content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64'),
                lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                sourceUri: targetUri,
            };
        }
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
