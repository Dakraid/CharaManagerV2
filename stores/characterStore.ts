export const useCharacterStore = defineStore('chars', {
    state: () => ({
        count: 0,
        characters: [] as Character[] | undefined,
        loading: false,
        currentPage: 1,
    }),
    getters: {
        highestId(): number {
            return this.characters?.reduce((max, char) => (char.id > max ? char.id : max), 0) ?? 0;
        },
    },
    actions: {
        async fetchCount() {
            try {
                this.count = await $fetch<number>('/api/chars/count', {
                    method: 'GET',
                });
            } catch (err: any) {
                console.warn('Failed to fetch the character count: %s', err);
            }
        },
        async fetchCharacters() {
            const appStore = useAppStore();
            try {
                const { data } = await useCachedAsyncData<Character[]>(`characters:${this.highestId}-${appStore.perPage}-${this.count}`, () =>
                    $fetch<Character[]>('/api/chars/characters', {
                        method: 'GET',
                        query: {
                            page: this.currentPage,
                            perPage: appStore.perPage,
                        },
                    })
                );
                this.characters = data.value ?? undefined;
            } catch (err: any) {
                console.warn('Failed to fetch the characters: %s', err);
            }
        },
        async refreshCharacters() {
            this.loading = true;
            await this.fetchCount();
            await this.fetchCharacters();
            this.loading = false;
        },
    },
});
