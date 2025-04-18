import dayjs from 'dayjs';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const validatedBody = await readValidatedBody(event, body => postWyvernUriSchema.safeParse(body));
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

        if (wyvernAvatar instanceof Blob || wyvernAvatar instanceof File) {
            const buffer = Buffer.from(await wyvernAvatar.arrayBuffer());
            return <FileUpload>{
                name: fileName,
                content: 'data:' + wyvernAvatar.type + ';base64,' + buffer.toString('base64'),
                lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                sourceUri: validatedBody.data.targetUri,
            };
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
