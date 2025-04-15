import * as Cards from 'character-card-utils';
import { encode } from 'gpt-tokenizer';

async function cleanCharacterBook(content: string) {
    const jsonCharacter = JSON.parse(content);

    try {
        if (jsonCharacter.data.character_book && jsonCharacter.data.character_book.entries) {
            const entries = jsonCharacter.data.character_book.entries;
            entries.forEach((entry: any) => {
                if (entry.position !== 'before_char' && entry.position !== 'after_char') {
                    entry.position = entry.position == 0 ? 'before_char' : 'after_char';
                }
            });

            return JSON.stringify(jsonCharacter);
        }
    } catch {
        // Ignore, no character book included
    }

    return content;
}

async function inputImageToCharacter(image: string): Promise<Cards.V2 | undefined> {
    try {
        const cleanedContent = await cleanCharacterBook(extractDefinition(image));
        const content = JSON.parse(cleanedContent);
        return Cards.parseToV2(content);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

async function getTokenCounts(card: Cards.V2): Promise<{ tokensPermanent: number; tokensTotal: number }> {
    const permanent = [card.data.description, card.data.personality];
    const total = [card.data.description, card.data.personality, card.data.first_mes];

    const tokensPermanent = encode(permanent.join('\n')).length;
    const tokensTotal = encode(total.join('\n')).length;

    return { tokensPermanent, tokensTotal };
}

export { cleanCharacterBook, inputImageToCharacter, getTokenCounts };
