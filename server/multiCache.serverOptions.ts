import { defineMultiCacheOptions } from 'nuxt-multi-cache/dist/runtime/serverOptions';
import lruCacheDriver from 'unstorage/drivers/lru-cache';

export default defineMultiCacheOptions({
    data: {
        storage: {
            driver: lruCacheDriver({}),
        },
    },
    component: {
        storage: {
            driver: lruCacheDriver({}),
        },
    },
});
