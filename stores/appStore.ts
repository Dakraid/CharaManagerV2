import { CardSize } from '~/utils/CardSize';

export const useAppStore = defineStore('app', {
    state: () => ({
        height: 0,
        blurChars: false,
        censorNames: false,
        cardSize: CardSize.Default,
        perPage: 30,
        imageQuality: 70,
    }),
    getters: {},
    actions: {
        setHeight(height: number) {
            this.height = height;
        },
        compareCardSize(cardSize: CardSize) {
            return this.cardSize === cardSize;
        },
    },
    persist: true,
});
