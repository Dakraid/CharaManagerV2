export default defineNitroPlugin(async (nitroApp) => {
    const { embeddingProvider, nomicKey } = useRuntimeConfig();

    let embedderProvider: BaseEmbedder;
    switch (embeddingProvider) {
        case 'fastembed': {
            embedderProvider = new FastEmbedder();
            await embedderProvider.initialize();
            break;
        }
        case 'nomic': {
            embedderProvider = new NomicEmbedder(nomicKey);
            await embedderProvider.initialize();
            break;
        }
        default:
            throw new Error('Invalid embedding provider');
    }

    nitroApp.hooks.hook('request', (event: any) => {
        event.context.$embedder = embedderProvider;
    });
});
