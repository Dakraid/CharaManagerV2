import type { HookResult } from '@nuxt/schema';

declare module '#app' {
    interface RuntimeNuxtHooks {
        'characters:menu': (id: number) => HookResult;
        'characters:refresh': () => HookResult;
    }
}
