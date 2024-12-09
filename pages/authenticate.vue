<script setup lang="ts">
const {user} = useUserSession();
const isDark = computed(() => useColorMode().value == 'dark');

const allowRegistration = ref<boolean>(false);

const response = await $fetch<boolean>('/api/auth/show', {
    method: 'GET',
});

allowRegistration.value = response ?? false;
</script>

<template>
    <div class="w-full h-full lg:grid lg:grid-rows-[1fr_1fr] gap-6 max-h-[calc(100vh_-_theme(spacing.16))] max-w-[1024px] mx-auto">
        <div class="hidden rounded-2xl w-full h-full overflow-hidden border bg-black lg:block lg:shadow-xl">
            <stunningTyndallEffect class="Container bg-gradient-to-br from-transparent to-white/20">
                <div class="Overlap flex gap-6 flex-col justify-center items-center">
                    <inspiraRadiantText
                        class="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400"
                        :duration="5">
                        <span class="text-6xl font-bold">Welcome to CharaManagerV2</span>
                    </inspiraRadiantText>

                    <NuxtImg src="/CharaManager.svg" alt="Image" class="w-64 rounded-2xl object-cover opacity-100 mix-blend-overlay z-20"/>

                    <Badge>VERSION 0.1.0-DEV</Badge>
                </div>
                <inspiraParticlesBg
                    class="absolute inset-0 [mask-image:radial-gradient(50%_50%,white,white_90%,transparent_100%)] z-10"
                    :quantity="300"
                    :ease="100"
                    :color="isDark ? '#FFF' : '#000'"
                    :staticity="10"
                    refresh/>
            </stunningTyndallEffect>
        </div>
        <div>
            <inspiraGlowBorder class="p-12 w-full" :color="['#A07CFE', '#FE8FB5', '#FFBE7B']">
                <div class="flex flex-col flex-wrap lg:flex-row lg:flex-nowrap z-40">
                    <AuthState>
                        <template #default="{ loggedIn, clear }">
                            <AuthLogin v-if="!loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0"/>
                            <div v-if="loggedIn" class="w-full flex flex-col gap-6 my-auto lg:w-[350px]">
                                <div class="flex flex-col gap-2 text-center w-full">
                                    <h1 class="text-3xl font-bold">Logout</h1>
                                    <p class="text-balance text-muted-foreground">To log out, click the button below.</p>
                                </div>
                                <Button v-if="loggedIn" @click="clear"> Logout</Button>
                            </div>
                            <div v-if="allowRegistration || loggedIn">
                                <Separator v-if="$device.isDesktop" orientation="vertical" class="my-auto mx-8 label-fix-black" label="OR"/>
                                <Separator v-else orientation="horizontal" class="mx-auto my-8 label-fix-black" label="OR"/>
                            </div>
                            <AuthRegister v-if="allowRegistration && !loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0"/>
                            <AuthUpdate v-if="loggedIn" class="w-full lg:w-[350px] lg:mx-8 lg:my-0"/>
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
