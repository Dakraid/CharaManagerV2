import * as fs from 'node:fs';
import path from 'node:path';
import Authenticate from '~/server/utils/Authenticate';
import StatusCode from '~/utils/StatusCode';

async function getLogContent(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join('logs', fileName), 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(data);
        });
    });
}

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const body = await readBody(event);
    try {
        return await getLogContent(body.fileName);
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
