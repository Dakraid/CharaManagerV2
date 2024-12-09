<script setup lang="ts">
import {useToast} from '~/components/ui/toast';

const {toast} = useToast();

definePageMeta({
    middleware() {
        const {loggedIn} = useUserSession();
        if (!loggedIn.value) {
            return navigateTo('/authenticate');
        }
    },
});

const loading = ref<boolean>(true);

const tags = ref<[string, number][]>([]);
const dates = ref<[string, number][]>([]);
const authors = ref<[string, number][]>([]);
const tokens = ref<[string, number][]>([]);


const {data} = await useFetch<Statistics>('/api/stats/retrieve', {
    method: 'POST',
});

if (data.value) {
    tags.value = data.value.charTags;
    dates.value = data.value.charDates;
    authors.value = data.value.charAuthors;
    tokens.value = data.value.charTokens;
} else {
    toast({
        title: 'Failed to retrieve statistics.',
        variant: 'destructive',
    });
}

const datesAsRecords = ref<Record<string, any>[]>(dates.value.map(([name, value]) => ({Date: name, Downloads: value})));
const authorsAsRecords = ref<Record<string, any>[]>(authors.value.map(([name, value]) => ({Author: name, Count: value})));
const tokensAsRecords = ref<Record<string, any>[]>(tokens.value.map(([name, value]) => ({Character: name, Tokens: value})));

loading.value = false;
</script>

<template>
    <Transition>
        <CommonLoading v-if="loading" loading-text="Compiling statistics..."/>
        <ScrollArea v-else class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-hidden scroll-smooth pr-4">
            <div v-if="datesAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Character Downloads per Date (Count > 0)</Label>
                <LineChart :data="datesAsRecords" index="Date" :categories="['Downloads']"/>
            </div>
            <div v-if="authorsAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Characters per Author</Label>
                <BarChart :data="authorsAsRecords" index="Author" :categories="['Count']"/>
            </div>
            <div v-if="tokensAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Tokens per Characters</Label>
                <BarChart :data="tokensAsRecords" index="Character" :categories="['Tokens']"/>
            </div>
            <div class="h-[calc(100vh_-_theme(spacing.36))] w-full mb-24 last:mb-0">
                <StatsTags :data="tags"/>
            </div>
        </ScrollArea>
    </Transition>
</template>

<style scoped></style>
