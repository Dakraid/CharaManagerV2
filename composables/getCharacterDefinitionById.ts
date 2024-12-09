export async function getCharacterDefinitionById(id: number): Promise<string | undefined> {
    const { data } = await useFetch<DefinitionRow[]>('/api/defs/definition', {
        method: 'GET',
        query: {
            id: id,
        },
    });

    if (data.value && data.value[0]) {
        if (data.value[0].definition.includes('\\"spec\\"')) {
            return JSON.parse(data.value[0].definition);
        } else {
            return data.value[0].definition;
        }
    }
}
