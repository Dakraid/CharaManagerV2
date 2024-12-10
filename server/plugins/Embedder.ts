export default defineNitroPlugin(async (nitroApp) => {
    const runtimeConfig = useRuntimeConfig();
    
    let embedderProvider: any;
    switch (runtimeConfig.embeddingProvider) {
        case 'openai':
            embedderProvider = new OpenAiEmbedder(runtimeConfig.oaiKey, runtimeConfig.oaiBaseUrl, runtimeConfig.oaiModel);
            await embedderProvider.initialize();
            break;
        case 'mistral':
            embedderProvider = new MistralEmbedder(runtimeConfig.mistralKey, runtimeConfig.mistralModel);
            await embedderProvider.initialize();
            break;
        case 'nomic':
            embedderProvider = new NomicEmbedder(runtimeConfig.nomicKey, runtimeConfig.nomicModel);
            await embedderProvider.initialize();
            break;
        default:
            throw new Error('Invalid embedding provider');
    }

    nitroApp.hooks.hook('request', (event: any) => {
        event.context.$embedder = embedderProvider;
    });
});
