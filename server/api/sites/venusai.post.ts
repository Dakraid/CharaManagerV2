import dayjs from 'dayjs';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedBody = await readValidatedBody(event, body => postVenusUriSchema.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }

    const characterPath = validatedBody.data.targetUri.split('/characters/')[1];
    const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';

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
                sourceUri: validatedBody.data.targetUri,
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
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            return {
                name: fileName,
                content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64'),
                lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                sourceUri: validatedBody.data.targetUri,
            } as FileUpload;
        }
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
