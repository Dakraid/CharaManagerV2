<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { CircleX, LoaderCircle, Plus, X } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';
import type { FileUpload } from '~/utils/Interfaces';

const { toast } = useToast();
const nuxtApp = useNuxtApp();
const characterStore = useCharacterStore();

const maxHeight = ref<number>(0);
const files = ref<FileUpload[]>([]);
const downloading = ref<boolean>(false);
const personalityToCreatorNotes = ref<boolean>(false);
const approveUpload = ref<string>('');
const currentUrl = ref<string>('');
const urlList = ref<string[]>([]);

const urlPrefixes = ['https://www.chub.ai/characters/', 'https://jannyai.com/characters/', 'https://app.wyvern.chat/characters/'];

const urlSchema = z
    .string()
    .url()
    .refine(
        (url) => {
            const validPrefix = urlPrefixes.some((prefix) => url.startsWith(prefix));
            const prefixCount = urlPrefixes.reduce((count, prefix) => count + (url.includes(prefix) ? 1 : 0), 0);
            return validPrefix && prefixCount === 1;
        },
        {
            message:
                "URL must start with 'https://www.chub.ai/characters/' or 'https://jannyai.com/characters/' or 'https://app.wyvern.chat/characters/' and have only one occurrence of either.",
        }
    );

const formSchema = toTypedSchema(
    z.object({
        links: z.array(urlSchema).min(1, 'At least one URL is required'),
    })
);

const { handleSubmit, setValues, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        links: [],
    },
});

function addUrl() {
    if (!currentUrl.value) return;

    try {
        urlSchema.parse(currentUrl.value);
        urlList.value.push(currentUrl.value);
        setValues({ links: urlList.value });
        currentUrl.value = '';
    } catch (error) {
        if (error instanceof z.ZodError) {
            toast({
                title: 'Invalid URL',
                description: error.errors[0].message,
                variant: 'destructive',
            });
        }
    }
}

function removeUrl(index: number) {
    urlList.value.splice(index, 1);
    setValues({ links: urlList.value });
}

const onSubmit = handleSubmit(async (values) => {
    files.value = [];
    downloading.value = true;

    try {
        for (const url of values.links) {
            if (url.startsWith('https://www.chub.ai/')) {
                const { data, error } = await useFetch<FileUpload>('/api/sites/venusai', {
                    method: 'POST',
                    body: {
                        targetUri: url,
                    },
                });

                if (!data.value) {
                    toast({
                        title: 'Error',
                        description: error.value?.message,
                        variant: 'destructive',
                    });
                    continue;
                }

                files.value.push(data.value);
            } else if (url.startsWith('https://jannyai.com')) {
                const { data, error } = await useFetch<FileUpload>('/api/sites/jannyai', {
                    method: 'POST',
                    body: {
                        targetUri: url,
                    },
                });

                if (!data.value) {
                    toast({
                        title: 'Error',
                        description: error.value?.message,
                        variant: 'destructive',
                    });
                    continue;
                }

                files.value.push(data.value);
            } else if (url.startsWith('https://app.wyvern.chat')) {
                const { data, error } = await useFetch<FileUpload>('/api/sites/wyvern', {
                    method: 'POST',
                    body: {
                        targetUri: url,
                    },
                });

                if (!data.value) {
                    toast({
                        title: 'Error',
                        description: error.value?.message,
                        variant: 'destructive',
                    });
                    continue;
                }

                files.value.push(data.value);
            }
        }
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }

    downloading.value = false;
});

async function uploadFiles() {
    await characterStore.updateLoadingState(true);
    try {
        const { data } = await useFetch('/api/chars/characters', {
            method: 'PUT',
            body: {
                files: files.value,
                personalityToCreatorNotes: personalityToCreatorNotes.value,
            },
        });

        if (!data.value) {
            throw new Error('Empty response received.');
        }

        toast({
            title: 'Upload successful!',
            description: data.value,
        });

        approveUpload.value = 'Uploaded files successfully!';
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
    files.value = [];
    urlList.value = [];
    setValues({ links: [] });

    await characterStore.refreshCharacters();
    await characterStore.updateLoadingState(false);
}

async function removeFile(filename: string) {
    files.value = files.value.filter((file) => file.name !== filename);
}

async function sidebarResizeHandler() {
    let containerHeight = document.getElementById('control-tabs')?.offsetHeight;
    if (containerHeight) {
        return containerHeight - 500;
    }
    containerHeight = document.getElementById('sidebar-tabs')?.offsetHeight;
    if (containerHeight) {
        return containerHeight - 500;
    }
}

onMounted(async () => {
    maxHeight.value = (await sidebarResizeHandler()) ?? 0;
    window.addEventListener('resize', async () => (maxHeight.value = (await sidebarResizeHandler()) ?? 0));
});
</script>

<template>
    <div class="flex flex-col gap-4 w-full">
        <form class="space-y-6 w-full" @submit="onSubmit">
            <FormField name="links">
                <FormItem>
                    <FormLabel>Source URIs</FormLabel>
                    <FormControl>
                        <div class="space-y-2 w-full">
                            <!-- Input for adding new URLs -->
                            <div class="flex gap-2">
                                <Input v-model="currentUrl" placeholder="Paste link here..." type="url" class="flex-grow" @keydown.enter.prevent="addUrl" />
                                <Button type="button" variant="outline" size="icon" @click="addUrl">
                                    <Plus class="h-4 w-4" />
                                </Button>
                            </div>

                            <!-- List of added URLs -->
                            <div v-if="urlList.length > 0" class="space-y-2 border rounded-md p-2 w-full">
                                <div v-for="(url, index) in urlList" :key="index" class="flex items-center gap-2 w-full">
                                    <div class="flex-grow text-sm truncate max-w-full overflow-hidden">{{ url }}</div>
                                    <Button type="button" variant="ghost" size="icon" class="flex-shrink-0" @click="removeUrl(index)">
                                        <X class="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FormControl>
                    <FormDescription>Add links from VenusAI, JannyAI, or Wyvern</FormDescription>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="w-full" :disabled="urlList.length === 0">Fetch</Button>
        </form>

        <Transition>
            <LoaderCircle v-if="downloading" class="mx-auto h-20 w-20 motion-safe:animate-spin" />
            <div v-else-if="files.length !== 0 && !downloading" class="flex flex-col gap-4">
                <Button variant="outline" @click="uploadFiles">Save</Button>
                <div class="flex justify-center gap-2 items-top">
                    <Checkbox id="importNotes" v-model:checked="personalityToCreatorNotes" />
                    <div class="grid gap-2 leading-none">
                        <label for="importNotes" class="peer-disabled:cursor-not-allowed text-center text-sm font-medium leading-none peer-disabled:opacity-70">
                            Import Personality as Creator Nodes?
                        </label>
                        <p class="text-center text-sm text-muted-foreground">Mainly for Cards from JannyAI.com</p>
                    </div>
                </div>
            </div>
        </Transition>
        <div
            id="previewContainerUpload"
            :class="cn('flex flex-wrap overflow-y-scroll bg-card rounded-md border p-4', files.length !== 0 && files.length <= 10 && !downloading ? '' : 'hidden')"
            :style="`max-height: ${maxHeight}px;`">
            <div v-for="file in files" :key="file.name" class="rounded-md border Preview">
                <CharsDisplayUpload :content="file.content" @remove="removeFile(file.name)" />
            </div>
        </div>
        <Transition>
            <p v-if="files.length !== 0 && files.length > 10 && !downloading" class="text-center text-sm text-muted-foreground">Too many files selected for preview.</p>
        </Transition>
    </div>
</template>

<style scoped></style>
