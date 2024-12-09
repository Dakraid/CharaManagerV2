import { S3Client } from '@aws-sdk/client-s3';
import type { H3Event } from 'h3';

export default async function (event: H3Event) {
    const runtimeConfig = useRuntimeConfig(event);

    return new S3Client({
        region: 'auto',
        endpoint: runtimeConfig.S3Endpoint,
        credentials: {
            accessKeyId: runtimeConfig.S3KeyID,
            secretAccessKey: runtimeConfig.S3KeySecret,
        },
    });
}
