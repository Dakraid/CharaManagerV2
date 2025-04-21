import { useCompression } from 'h3-compression';
import { defineNitroPlugin } from 'nitropack/runtime';

const allowedContentTypes = ['text/html', 'text/plain', 'text/json', 'application/javascript', 'text/css'];

export default defineNitroPlugin((nitro) => {
    nitro.hooks.hook('render:response', async (response, { event }) => {
        const is404Error = event._path?.includes('/__nuxt_error') || event._path?.includes('statusCode=404');
        if (is404Error) {
            return;
        }

        const contentType = response.headers?.['content-type'];
        if (!contentType || !allowedContentTypes.some((type) => contentType.startsWith(type))) {
            return;
        }

        if (response.headers?.['content-encoding']) {
            return;
        }

        await useCompression(event, response);
    });
});
