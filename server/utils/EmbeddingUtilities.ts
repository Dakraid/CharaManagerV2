import type * as Cards from 'character-card-utils';
import { isWithinTokenLimit } from 'gpt-tokenizer';

async function getEmbeddings(card: Cards.V2, embedderProvider: any): Promise<number[] | undefined> {
    try {
        let embedding: number[] | undefined;
        if (isWithinTokenLimit(card.data.description, 8192)) {
            embedding = await embedderProvider.embed(card.data.description);
        }

        if (embedding?.length && embedding?.length <= 1) {
            embedding = undefined;
        }

        return embedding;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export default getEmbeddings;
