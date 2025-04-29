import * as Cards from 'character-card-utils';
import { debounce } from 'perfect-debounce';

export const useCharacterStore = defineStore('chars', {
    state: () => ({
        appLoading: false,
        isFetching: false,
        count: -1,
        highest: -1,
        loadedCharacters: [] as Character[] | undefined,
        loadedCharacter: undefined as { character: CharacterWithDef; definition: Cards.V2 } | undefined,
    }),
    getters: {
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
        characterWithDef(state): { character: CharacterWithDef; definition: Cards.V2 } {
            if (!state.loadedCharacter) {
                throw new Error('No character loaded');
            }

            return state.loadedCharacter;
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
        async fetchCharacterWithDef(id: number) {
            this.isFetching = true;
            try {
                const { data, error, status, execute } = await useCachedAsyncData<CharacterWithDef>(`character:full-${id}`, () =>
                    $fetch<CharacterWithDef>('/api/chars/character', {
                        method: 'GET',
                        query: {
                            id: id,
                        },
                    })
                );

                if (!data.value && status.value === 'idle' && execute) {
                    await execute();
                }

                while (status.value === 'pending') {
                    await Sleep(100);
                }

                if (error.value) {
                    throw error.value;
                }

                if (!data.value) {
                    throw new Error('Failed to fetch character, received undefined.');
                }

                let json;
                if (data.value.definition.includes('\\"spec\\"')) {
                    json = JSON.parse(JSON.parse(data.value.definition));
                } else {
                    json = JSON.parse(data.value.definition);
                }

                if (!json) {
                    throw new Error('Failed to parse character definition.');
                }

                this.loadedCharacter = { character: data.value, definition: Cards.parseToV2(json) };
            } catch (err: any) {
                console.error('Failed to fetch character with def: %s', err);
            } finally {
                this.isFetching = false;
            }
        },
    },
});
