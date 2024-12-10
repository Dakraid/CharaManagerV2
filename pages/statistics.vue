<script setup lang="ts">
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

definePageMeta({
    middleware() {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) {
            return navigateTo('/authenticate');
        }
    },
});

const loading = ref<boolean>(true);
const error = ref<boolean>(false);

const tags = ref<[string, number][]>([]);
const dates = ref<[string, number][]>([]);
const authors = ref<[string, number][]>([]);
const tokens = ref<[string, number][]>([]);

const datesAsRecords = ref<Record<string, any>[]>([]);
const authorsAsRecords = ref<Record<string, any>[]>([]);
const tokensAsRecords = ref<Record<string, any>[]>([]);

onMounted(async () => {
    try {
        const stats = await $fetch<Statistics>('/api/stats/retrieve', {
            method: 'POST',
        });

        if (stats) {
            tags.value = stats.charTags;
            dates.value = stats.charDates;
            authors.value = stats.charAuthors;
            tokens.value = stats.charTokens;

            datesAsRecords.value = dates.value.map(([name, value]) => ({ Date: name, Downloads: value }));
            authorsAsRecords.value = authors.value.map(([name, value]) => ({ Author: name, Count: value }));
            tokensAsRecords.value = tokens.value.map(([name, value]) => ({ Character: name, Tokens: value }));
        } else {
            toast({
                title: 'Received empty statistics.',
                variant: 'destructive',
            });
            error.value = true;
        }
    } catch (err: any) {
        toast({
            title: 'Failed to retrieve statistics.',
            variant: 'destructive',
        });
        error.value = true;
    }

    loading.value = false;
});
</script>

<template>
    <Transition>
        <CommonLoading v-if="loading" loading-text="Compiling statistics..." />
        <ScrollArea v-else-if="!error" class="max-h-[calc(100vh_-_theme(spacing.36))] rounded-md overflow-y-hidden scroll-smooth pr-4">
            <div v-if="datesAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Character Downloads per Date (Count > 0)</Label>
                <LineChart :data="datesAsRecords" index="Date" :categories="['Downloads']" />
            </div>
            <div v-if="authorsAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Characters per Author</Label>
                <BarChart :data="authorsAsRecords" index="Author" :categories="['Count']" />
            </div>
            <div v-if="tokensAsRecords.length > 0" class="flex flex-col gap-4 mb-24 last:mb-0">
                <Label>Tokens per Characters</Label>
                <BarChart :data="tokensAsRecords" index="Character" :categories="['Tokens']" />
            </div>
            <div v-if="tags.length > 0" class="h-[calc(100vh_-_theme(spacing.36))] w-full mb-24 last:mb-0">
                <StatsTags :data="tags" />
            </div>
        </ScrollArea>
        <CommonError v-else error="No statistics available..." />
    </Transition>
</template>

<style scoped></style>
