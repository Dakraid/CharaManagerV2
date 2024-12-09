import { Mistral } from '@mistralai/mistralai';
import { Embedder } from '@nomic-ai/atlas';
import { OpenAI } from 'openai';

export abstract class BaseEmbedder {
    initialize(): Promise<void> {
        return Promise.resolve();
    }

    abstract embed(value: string | string[]): Promise<number[] | number[][]>;
}

export class OpenAiEmbedder extends BaseEmbedder {
    private provider: OpenAI | null = null;
    private readonly apiKey: string;
    private readonly baseURL: string;
    private readonly model: string;

    constructor(apiKey: string, baseURL: string = '', model: string = 'text-embedding-3-large') {
        super();
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.model = model;
    }

    async initialize() {
        if (this.baseURL.trim() === '') {
            this.provider = new OpenAI({
                apiKey: this.apiKey,
            });
        } else {
            this.provider = new OpenAI({
                baseURL: this.baseURL,
                apiKey: this.apiKey,
            });
        }
    }

    async embed(value: string | string[]): Promise<number[] | number[][]> {
        if (!this.provider) {
            throw new Error('OpenAiEmbedder not initialized. Call initialize() first.');
        }

        if (Array.isArray(value)) {
            const result = await this.provider.embeddings.create({
                input: value,
                model: this.model,
            });

            const embeddings = result.data.map((item) => item.embedding);

            if (embeddings.some((embedding) => !embedding)) {
                throw new Error('Failed to get embeddings from Mistral for some inputs.');
            }

            return embeddings as number[][];
        }

        const result = await this.provider.embeddings.create({
            input: [value],
            model: this.model,
        });

        return result.data[0].embedding;
    }
}

export class MistralEmbedder extends BaseEmbedder {
    private provider: Mistral | null = null;
    private readonly apiKey: string;
    private readonly model: string;

    constructor(apiKey: string, model: string = 'mistral-embed') {
        super();
        this.apiKey = apiKey;
        this.model = model;
    }

    async initialize() {
        this.provider = new Mistral({
            apiKey: this.apiKey,
        });
    }

    async embed(value: string | string[]): Promise<number[] | number[][]> {
        if (!this.provider) {
            throw new Error('MistralEmbedder not initialized. Call initialize() first.');
        }

        if (Array.isArray(value)) {
            const result = await this.provider.embeddings.create({
                inputs: value,
                model: this.model,
            });

            const embeddings = result.data.map((item) => item.embedding);

            if (embeddings.some((embedding) => !embedding)) {
                throw new Error('Failed to get embeddings from Mistral for some inputs.');
            }

            return embeddings as number[][];
        }

        const result = await this.provider.embeddings.create({
            inputs: [value],
            model: this.model,
        });

        if (!result.data[0].embedding) {
            throw new Error('Failed to get embeddings from Mistral.');
        }

        return result.data[0].embedding;
    }
}

export class NomicEmbedder extends BaseEmbedder {
    private provider: Embedder | null = null;
    private readonly apiKey: string;
    private readonly model: string;

    constructor(apiKey: string, model: string = 'nomic-embed-text-v1.5') {
        super();
        this.apiKey = apiKey;
        this.model = model;
    }

    async initialize() {
        switch (this.model) {
            case 'nomic-embed-text-v1':
                this.provider = new Embedder(this.apiKey, {
                    model: 'nomic-embed-text-v1',
                });
                break;
            case 'nomic-embed-text-v1.5':
                this.provider = new Embedder(this.apiKey, {
                    model: 'nomic-embed-text-v1.5',
                });
                break;
            default:
                throw new Error(`Unsupported model: ${this.model}`);
        }
    }

    async embed(value: string | string[]): Promise<number[] | number[][]> {
        if (!this.provider) {
            throw new Error('NomicEmbedder not initialized. Call initialize() first.');
        }

        if (Array.isArray(value)) {
            return await this.provider.embed(value);
        }

        const result = await this.provider.embed([value]);
        return result[0];
    }
}
