import * as fs from 'node:fs';
import path from 'node:path';
import Authenticate from '~/server/utils/Authenticate';
import StatusCode from '~/utils/StatusCode';

async function getLogFiles(dirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            const logFiles = files.filter((file) => path.extname(file) === '.log' && file.includes('info')).sort();
            resolve(logFiles);
        });
    });
}

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    try {
        return await getLogFiles('./logs');
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }
});
