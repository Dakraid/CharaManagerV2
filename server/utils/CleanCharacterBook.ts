export default async function CleanCharacterBook(content: string) {
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
