<script setup lang="ts">
import { cn } from '~/lib/utils';

const config = useRuntimeConfig();
const characterStore = useCharacterStore();
const isDark = computed(() => useColorMode().value == 'dark');

const allowRegistration = ref(false);
const showVersion = ref(false);

const response = await $fetch<boolean>('/api/auth/show', {
    method: 'GET',
});

allowRegistration.value = response ?? false;

onMounted(() => {
    characterStore.loading = false;
});
</script>

<template>
    <div class="p-4 w-full h-full grid grid-rows-[1fr_1fr] gap-4 max-h-[calc(100vh_-_theme(spacing.16))] max-w-[1024px] mx-auto">
        <div class="overflow-hidden rounded-2xl border bg-black h-full w-full lg:block lg:shadow-xl" @mouseover="showVersion = true" @mouseleave="showVersion = false">
            <stunningTyndallEffect class="Container bg-gradient-to-br from-transparent to-white/20 p-6">
                <div class="flex flex-col items-center justify-center gap-2 lg:gap-6 Overlap">
                    <inspiraRadiantText
                        class="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400"
                        :duration="5">
                        <span class="text-center text-4xl lg:text-6xl font-bold">Welcome to CharaManagerV2</span>
                    </inspiraRadiantText>

                    <NuxtImg src="/CharaManager.svg" alt="Image" class="z-20 w-48 lg:w-64 rounded-2xl object-cover opacity-100 mix-blend-overlay" />

                    <Badge :class="cn('mix-blend-overlay transition-opacity', showVersion ? 'opacity-100' : 'opacity-0')">Version 0.5.0-{{ config.public.gitCommitHash }}</Badge>
                </div>
                <inspiraParticlesBg
                    class="absolute inset-0 [mask-image:radial-gradient(50%_50%,white,white_90%,transparent_100%)] z-10"
                    :quantity="300"
                    :ease="100"
                    :color="isDark ? '#FFF' : '#000'"
                    :staticity="10"
                    refresh />
            </stunningTyndallEffect>
        </div>
        <div>
            <inspiraGlowBorder class="w-full p-12" :color="['#A07CFE', '#FE8FB5', '#FFBE7B']">
                <div class="z-40 flex flex-col flex-wrap lg:flex-row lg:flex-nowrap">
                    <AuthState>
                        <template #default="{ loggedIn, clear }">
                            <AuthLogin v-if="!loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0" />
                            <div v-if="loggedIn" class="my-auto flex w-full flex-col gap-6 lg:w-[350px]">
                                <div class="flex w-full flex-col gap-2 text-center">
                                    <h1 class="text-3xl font-bold">Logout</h1>
                                    <p class="text-balance text-muted-foreground">To log out, click the button below.</p>
                                </div>
                                <Button v-if="loggedIn" @click="clear"> Logout</Button>
                            </div>
                            <div v-if="allowRegistration || loggedIn">
                                <Separator v-if="$device.isDesktop" orientation="vertical" class="mx-8 my-auto label-fix-black" label="OR" />
                                <Separator v-else orientation="horizontal" class="mx-auto my-8 label-fix-black" label="OR" />
                            </div>
                            <AuthRegister v-if="allowRegistration && !loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0" />
                            <AuthUpdate v-if="loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0" />
                        </template>
                        <template #placeholder>
                            <Button disabled> Loading...</Button>
                        </template>
                    </AuthState>
                </div>
            </inspiraGlowBorder>
        </div>
    </div>
</template>

<style scoped>
.Container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    gap: 0;
    grid-template-areas: 'Overlap';
}

.Overlap {
    grid-area: Overlap;
}
</style>
