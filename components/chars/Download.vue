<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { CircleX, LoaderCircle } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { useToast } from '~/components/ui/toast';
import type { FileUpload } from '~/utils/Interfaces';

const { toast } = useToast();
const nuxtApp = useNuxtApp();
const characterStore = useCharacterStore();

const maxHeight = ref<number>(0);
const files = ref<FileUpload[]>([]);
const downloading = ref<boolean>(false);
const personalityToCreatorNotes = ref<boolean>(false);
const approveUpload = ref<string>('');

const urlPrefixes = ['https://www.chub.ai/characters/', 'https://jannyai.com/characters/'];

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
            message: "URL must start with 'https://www.chub.ai/characters/' or 'https://jannyai.com/characters/' and have only one occurrence of either.",
        }
    );

const urlsArraySchema = z
    .string()
    .url()
    .transform((val) => val.split('\n'))
    .refine(
        (urls) => {
            return urls.every((url) => {
                const validPrefix = urlPrefixes.some((prefix) => url.startsWith(prefix));
                const prefixCount = urlPrefixes.reduce((count, prefix) => count + (url.includes(prefix) ? 1 : 0), 0);
                return validPrefix && prefixCount === 1;
            });
        },
        {
            message: "Each URL must start with 'https://www.chub.ai/characters/' or 'https://jannyai.com/characters/' and have only one occurrence of either.",
        }
    );

const formSchema = toTypedSchema(
    z.object({
        links: z.union([urlSchema, urlsArraySchema]),
    })
);

const { handleSubmit } = useForm({
    validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
    files.value = [];
    downloading.value = true;
    if (values.links.includes('\n')) {
        try {
            for (const value of (values.links as string).split('\n')) {
                if (value.startsWith('https://www.chub.ai/')) {
                    const { data, error } = await useFetch<FileUpload>('/api/sites/venusai', {
                        method: 'POST',
                        body: {
                            targetUri: value,
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
                } else if (value.startsWith('https://jannyai.com')) {
                    const { data, error } = await useFetch<FileUpload>('/api/sites/jannyai', {
                        method: 'POST',
                        body: {
                            targetUri: value,
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
    } else {
        try {
            if ((values.links as string).startsWith('https://www.chub.ai/')) {
                const { data, error } = await useFetch<FileUpload>('/api/sites/venusai', {
                    method: 'POST',
                    body: {
                        targetUri: values.links,
                    },
                });

                if (!data.value) {
                    throw error;
                }

                files.value.push(data.value);
            } else if ((values.links as string).startsWith('https://jannyai.com')) {
                const { data, error } = await useFetch<FileUpload>('/api/sites/jannyai', {
                    method: 'POST',
                    body: {
                        targetUri: values.links,
                    },
                });

                if (!data.value) {
                    throw error;
                }

                files.value.push(data.value);
            }
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        }
    }
    downloading.value = false;
});

async function uploadFiles() {
    characterStore.loading = true;
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
        await nuxtApp.hooks.callHook('characters:refresh');
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
    files.value = [];
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
    <div class="flex flex-col gap-4">
        <form class="w-full space-y-6" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="links">
                <FormItem>
                    <FormLabel>Source URIs</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Paste links here..." class="resize-none" v-bind="componentField" />
                    </FormControl>
                    <FormDescription>One link per line.<br />Supported are VenusAI and JannyAI</FormDescription>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="w-full">Fetch</Button>
        </form>

        <Transition>
            <LoaderCircle v-if="downloading" class="h-20 w-20 mx-auto motion-safe:animate-spin" />
            <div v-else-if="files.length !== 0 && !downloading" class="flex flex-col gap-4">
                <Button variant="outline" @click="uploadFiles">Save</Button>
                <div class="flex items-top justify-center gap-2">
                    <Checkbox id="importNotes" v-model:checked="personalityToCreatorNotes" />
                    <div class="grid gap-2 leading-none">
                        <label for="importNotes" class="text-sm text-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Import Personality as Creator Nodes?
                        </label>
                        <p class="text-sm text-center text-muted-foreground">Mainly for Cards from JannyAI.com</p>
                    </div>
                </div>
            </div>
            <div
                v-if="files.length !== 0 && files.length <= 10 && !downloading"
                id="previewContainerUpload"
                class="flex flex-wrap overflow-y-scroll bg-card rounded-md border p-4"
                :style="`max-height: ${maxHeight}px;`">
                <div v-for="file in files" :key="file.name" class="Preview border rounded-md">
                    <CharsDisplayUpload :content="file.content" @remove="removeFile(file.name)" />
                </div>
            </div>
            <p v-else-if="files.length !== 0 && !downloading" class="text-sm text-center text-muted-foreground">Too many files selected for preview.</p>
        </Transition>
    </div>
</template>

<style scoped></style>
