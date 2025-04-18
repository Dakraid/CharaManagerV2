import { debounce } from 'perfect-debounce';

export const useCharacterStore = defineStore('chars', {
    state: () => ({
        appLoading: false,
        isFetching: false,
        count: -1,
        highest: -1,
        loadedCharacters: [] as Character[] | undefined,
    }),
    getters: {
        loadingState(state): boolean {
            return state.appLoading || state.isFetching;
        },
        characterHighest(state): number {
            return state.highest;
        },
        characterCount(state): number {
            return state.count;
        },
        characterList(state): Character[] {
            return state.loadedCharacters || [];
        },
        characterById: (state) => {
            return (id: number) => state.loadedCharacters?.find((char) => char.id === id);
        },
    },
    actions: {
        async updateLoadingState(loading: boolean) {
            const debouncedFn = debounce(
                async (newLoading: boolean) => {
                    this.appLoading = newLoading || this.isFetching;
                },
                100,
                { leading: true }
            );
            await debouncedFn(loading);
        },
        async fetchHighestId() {
            try {
                const highest = await $fetch<number | undefined>('/api/chars/highest', {
                    method: 'GET',
                });

                if (!highest) {
                    throw new Error('Received invalid character count, please check the server logs for more information.');
                }

                this.highest = highest;
            } catch (err: any) {
                console.warn('Failed to fetch the character count: %s', err);
            }
        },
        async fetchCount() {
            try {
                const { data, error } = await useCachedAsyncData<number>(`characters:count-${this.characterHighest}`, () =>
                    $fetch<number>('/api/chars/count', {
                        method: 'GET',
                    })
                );

                if (!data.value) {
                    throw error.value;
                }

                this.count = data.value;
            } catch (err: any) {
                console.warn('Failed to fetch the character count: %s', err);
            }
        },
        async fetchCharacters() {
            const appStore = useAppStore();
            try {
                const { data, error } = await useCachedAsyncData<Character[]>(`characters:list-${this.characterHighest}-${appStore.currentPage}-${appStore.perPage}`, () =>
                    $fetch<Character[]>('/api/chars/characters', {
                        method: 'GET',
                        query: {
                            page: appStore.currentPage,
                            perPage: appStore.perPage,
                        },
                    })
                );

                if (!data.value) {
                    throw error.value;
                }

                this.loadedCharacters = data.value;
            } catch (err: any) {
                console.warn('Failed to fetch the characters: %s', err);
            }
        },
        async refreshCharacters() {
            while (this.isFetching) {
                await Sleep(100);
            }

            this.isFetching = true;
            try {
                await this.fetchHighestId();
                await this.fetchCount();
                await this.fetchCharacters();
            } catch (err: any) {
                console.error('Failed to update character store: %s', err);
            } finally {
                this.isFetching = false;
            }
        },
    },
});
