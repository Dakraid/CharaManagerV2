export const useCharacterStore = defineStore('chars', {
    state: () => ({
        count: 0,
        characters: [] as Character[] | undefined,
        activeCharacter: undefined as Character | undefined,
        loading: false,
        currentPage: 1,
    }),
    getters: {
        highestId(): number {
            return this.characters?.reduce((max, char) => (char.id > max ? char.id : max), 0) ?? 0;
        },
    },
    actions: {
        async setActiveCharacter(id: number) {
            this.activeCharacter = this.characters?.find((c) => c.id === id);
        },
    },
});
