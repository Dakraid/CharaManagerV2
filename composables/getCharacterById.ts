export async function getCharacterById(id: number): Promise<Character | undefined> {
    const characters = await $fetch<Character[]>('/api/chars/characters', {
        method: 'POST',
        body: {
            ids: [id],
        },
    });

    if (characters !== null && characters.length > 0) {
        return characters[0];
    }
}
