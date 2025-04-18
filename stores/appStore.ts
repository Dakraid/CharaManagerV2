import { CardSize } from '~/utils/CardSize';

export const useAppStore = defineStore('app', {
    state: () => ({
        currentPage: 1,
        height: 0,
        blurChars: false,
        censorNames: false,
        cardSize: CardSize.Default,
        perPage: 30,
        imageQuality: 70,
        zoomLevel: 1.5,
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
