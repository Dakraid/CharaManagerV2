import dayjs from 'dayjs';

export default defineEventHandler(async (event) => {
    // await Authenticate(event);

    const validatedBody = await readValidatedBody(event, body => postVenusUriSchema.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }

    const characterPath = validatedBody.data.targetUri.split('/characters/')[1];
    const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';

    const [creatorName, projectName] = characterPath.split('/');

    try {
        const projectResponse = await fetch(`https://api.chub.ai/api/characters/${creatorName}/${projectName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            },
        });

        if (!projectResponse.ok) {
            const responseText = await projectResponse.text();
            throw new Error('Failed to fetch character: ' + projectResponse.statusText + ' | ' + responseText + '');
        }

        const characterProject = await projectResponse.json();
        const characterUrl = characterProject.node?.max_res_url;

        if (!characterUrl) {
            throw new Error('Download URL not found in character.');
        }

        const characterResponse = await fetch(characterUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            },
        });

        if (!characterResponse.ok) {
            const responseText = await characterResponse.text();
            throw new Error('Failed to fetch character: ' + characterResponse.statusText + ' | ' + responseText + '');
        }

        const buffer = Buffer.from(await characterResponse.arrayBuffer());
        return <FileUpload>{
            name: fileName,
            content: 'data:' + characterResponse.type + ';base64,' + buffer.toString('base64'),
            lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            sourceUri: validatedBody.data.targetUri,
        };
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
