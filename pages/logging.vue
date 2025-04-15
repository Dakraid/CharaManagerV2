<script setup lang="ts">
import dayjs from 'dayjs';
import { LoaderCircle } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

definePageMeta({
    middleware() {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) {
            return navigateTo('/authenticate');
        }
    },
});

const characterStore = useCharacterStore();
const logSelected = ref<string | null>();
const logContent = ref<LogEntry[]>([]);

characterStore.loading = true;
const { data } = await useFetch<string[]>('/api/logs/list', {
    method: 'GET',
});

useRouteCache((helper) => {
    helper
        .setMaxAge(3600)
        .setCacheable()
        .allowStaleWhileRevalidate()
        .addTags([`logging:${data.value?.length ?? 0}`]);
});

const logs = data.value;

async function getLog(logName: string) {
    const { data } = await useFetch<string>('/api/logs/retrieve', {
        method: 'POST',
        body: {
            fileName: logName,
        },
    });

    logSelected.value = logName;
    if (data.value) {
        const logRegex = /^(?<level>[a-z]+): (?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):\s+(?<message>[\s\S]*?)(?=\n[a-z]+:|\n$)/gm;
        const matches = Array.from(data.value.matchAll(logRegex));

        let count = 0;
        matches.forEach((match) => {
            const { level, timestamp, message } = match.groups!;
            logContent.value.push({
                id: count++,
                level: level,
                timestamp: dayjs(timestamp).toDate(),
                message: message.trim(),
            });
        });
    } else {
        logContent.value = [];
    }
}

function getLogLevelColor(level: string) {
    switch (level) {
        case 'info':
            return 'bg-blue-900/50';
        case 'warn':
            return 'bg-yellow-900/50';
        case 'error':
            return 'bg-red-900/50';
        default:
            return 'bg-gray-900/50';
    }
}

characterStore.loading = false;
</script>

<template>
    <div class="grid flex-1 grid-rows-[min-content_1fr]">
        <div class="mx-auto grid w-full gap-2">
            <h1 class="mb-8 text-3xl font-semibold">Logging</h1>
        </div>
        <div class="mx-auto grid w-full items-start gap-6 grid-rows-[min-content_1fr] lg:grid-rows-[1fr] lg:grid-cols-[300px_1fr]">
            <nav class="grid gap-4 text-sm text-muted-foreground md:self-stretch">
                <Transition>
                    <LoaderCircle v-if="!logs" class="mx-auto h-10 w-10 animate-spin" />
                    <ScrollArea v-else-if="logs.length !== 0" class="rounded-lg border p-4 shadow-sm bg-card text-card-foreground">
                        <Button v-for="item in logs" :key="item" variant="outline" class="mb-4 w-full" @click="getLog(item)">{{ item }}</Button>
                    </ScrollArea>
                    <h1 v-else class="rounded-lg border p-4 text-xl shadow-sm bg-card text-card-foreground">No logs available.</h1>
                </Transition>
            </nav>
            <Transition>
                <div v-if="logSelected !== null && logSelected?.trim() !== ''" :key="logSelected" class="flex gap-6 self-stretch">
                    <Card class="flex flex-1 flex-col">
                        <CardHeader>
                            <CardTitle>{{ logSelected }} ({{ logContent.length }} entries)</CardTitle>
                        </CardHeader>
                        <CardContent class="flex-1">
                            <ScrollArea class="pr-4 h-[calc(100vh_-_20rem)] rounded-md">
                                <Table>
                                    <TableCaption>A list of the selected log's entries.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Message</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow v-for="log in logContent" :key="log.id" :class="cn(getLogLevelColor(log.level))">
                                            <TableCell>{{ log.level }}</TableCell>
                                            <TableCell>{{ log.timestamp.toLocaleString() }}</TableCell>
                                            <TableCell class="whitespace-pre">
                                                {{ log.message }}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
                <div v-else class="flex gap-6 self-stretch">
                    <Card class="flex flex-1 flex-col"></Card>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
