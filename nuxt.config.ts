// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
            title: 'CharaManagerV2',
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    devtools: { enabled: true },
    sourcemap: true,
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/test-utils/module',
        '@nuxtjs/color-mode',
        '@nuxtjs/device',
        '@nuxtjs/robots',
        '@pinia/nuxt',
        '@vite-pwa/nuxt',
        '@vueuse/motion/nuxt',
        'nuxt-auth-utils',
        'nuxt-booster',
        'nuxt-echarts',
        'nuxt-file-storage',
        'nuxt-lodash',
        'nuxt-monaco-editor',
        'nuxt-multi-cache',
        'nuxt-rating',
        'nuxt3-winston-log',
        'pinia-plugin-persistedstate/nuxt',
        'shadcn-nuxt',
    ],
    css: ['~/assets/css/main.css'],
    vite: {
        plugins: [tailwindcss()],
    },
    nitro: {
        experimental: {
            tasks: true,
        },
    },
    typescript: {
        typeCheck: false,
    },
    build: {
        transpile: ['dayjs/plugin/customParseFormat'],
    },
    experimental: {
        watcher: 'parcel',
        crossOriginPrefetch: true,
        asyncEntry: true,
        writeEarlyHints: true,
        sharedPrerenderData: true,
        buildCache: true,
    },
    future: {
        typescriptBundlerResolution: true,
    },
    colorMode: {
        classSuffix: '',
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
    nuxt3WinstonLog: {
        skipRequestMiddlewareHandler: true,
    },
    multiCache: {
        component: {
            enabled: true,
        },
        route: {
            enabled: true,
        },
        data: {
            // This seems to be broken right now, so it is disabled.
            enabled: false,
        },
        cdn: {
            enabled: false,
            cacheControlHeader: 'CDN-Cache-Control',
            cacheTagHeader: 'Cache-Tag',
        },
    },
    site: {
        indexable: false,
    },
    robots: {
        blockNonSeoBots: true,
        blockAiBots: true,
    },
    runtimeConfig: {
        debugMode: false,
        // Registration
        allowRegistration: true,
        singleUserMode: true,
        // Database
        dbHost: '',
        dbUser: '',
        dbPassword: '',
        dbDatabase: '',
        // Migration
        dbMigrate: false,
        dbMigrations: './utils/drizzle',
        // Embeddings
        matchThreshold: 0.98,
        embeddingProvider: 'nomic',
        oaiKey: '',
        oaiBaseUrl: '',
        oaiModel: 'text-embedding-3-large',
        mistralKey: '',
        mistralModel: 'mistral-embed',
        nomicKey: '',
        nomicModel: 'nomic-embed-text-v1.5',
        // 2Captcha Solver
        captchaSolverKey: '',
        // Image File Settings
        imageFolder: '',
        public: {
            imageDomain: '',
        },
        // Experimental
        expUseS3ImageStore: false,
        // S3 Configuration
        S3Bucket: '',
        S3Endpoint: '',
        S3KeyID: '',
        S3KeySecret: '',
    },
});
