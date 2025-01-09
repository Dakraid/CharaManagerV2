<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';

const nuxtApp = useNuxtApp();
const characterStore = useCharacterStore();
const { handleFileInput, files } = useFileStorage();
const { toast } = useToast();

const maxHeight = ref<number>(0);
const fileInput = ref<HTMLInputElement>();
const isOver = ref<boolean>(false);
const approveUpload = ref<string>('');
const personalityToCreatorNotes = ref<boolean>(false);

async function handleDrop(e: any) {
    e.preventDefault();
    e.target.classList.remove('drag-active');

    const fileList = e.target.files || e.dataTransfer.files;
    if (!fileList.length) return;

    const serializeFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            files.value.push({
                content: e.target.result,
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                type: file.type,
                arrayBuffer: () => file.arrayBuffer(),
                slice: (start: any, end: any, contentType: any) => file.slice(start, end, contentType),
                stream: () => file.stream(),
                text: () => file.text(),
            });
        };
        reader.readAsDataURL(file);
    };

    let showWarn = false;
    for (const file of fileList) {
        if (file.type !== 'image/png') {
            showWarn = true;
            continue;
        }
        serializeFile(file);
    }

    if (showWarn) {
        approveUpload.value = 'Only PNGs are allowed to be uploaded!';
        setTimeout(() => {
            approveUpload.value = '';
        }, 3000);
    }

    const filesElement = document.getElementById('file-input');

    if (!filesElement) {
        return;
    }

    const changeEvent = new Event('change');
    filesElement.dispatchEvent(changeEvent);
}

async function clearFileInput(ctrl: any) {
    try {
        ctrl.value = null;
    } catch (ex) {
        // This is fine
    }
    if (ctrl.value) {
        ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
    }
}

async function clearFiles() {
    await clearFileInput(document.getElementById('file-input'));
    files.value = [];
}

async function uploadFiles() {
    characterStore.loading = true;
    approveUpload.value = '';

    try {
        if (files.value.length > 10) {
            for (let i = 0; i < files.value.length; i += 20) {
                const chunk = files.value.slice(i, i + 20);
                try {
                    const { data } = await useFetch('/api/chars/character', {
                        method: 'PUT',
                        body: {
                            files: chunk,
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
                } catch (err: any) {
                    console.log(err);
                }

                approveUpload.value = `Uploaded ${i} of ${files.value.length} files.`;
            }
        } else {
            try {
                const { data } = await useFetch('/api/chars/character', {
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
            } catch (err: any) {
                console.log(err);
            }
        }

        approveUpload.value = 'Uploaded files successfully!';

        await clearFiles();
        await nuxtApp.hooks.callHook('characters:refresh');
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
}

async function sidebarResizeHandler() {
    let containerHeight = document.getElementById('control-tabs')?.offsetHeight;
    if (containerHeight) {
        return containerHeight - 474;
    }
    containerHeight = document.getElementById('sidebar-tabs')?.offsetHeight;
    if (containerHeight) {
        return containerHeight - 474;
    }
}

async function removeFile(filename: string) {
    files.value = files.value.filter((file) => file.name !== filename);
}

onMounted(async () => {
    maxHeight.value = (await sidebarResizeHandler()) ?? 0;
    window.addEventListener('resize', async () => (maxHeight.value = (await sidebarResizeHandler()) ?? 0));
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <Transition>
            <Button v-if="files.length !== 0" variant="destructive" @click="clearFiles">Clear</Button>
        </Transition>

        <label
            id="dropcontainer"
            for="images"
            :class="cn('flex flex-col justify-center items-center border bg-background/30 rounded-md gap-2 p-4 transition-colors hover:bg-accent', isOver ? 'drag-active' : '')"
            @dragover.prevent
            @dragenter.prevent="
                (e: any) => {
                    isOver = true;
                }
            "
            @dragleave.prevent="
                (e: any) => {
                    isOver = false;
                }
            "
            @drop.prevent="handleDrop">
            <h1 class="text-lg font-bold text-center text-foreground">Drop files here</h1>
            or
            <Input id="file-input" ref="fileInput" type="file" name="files[]" accept="image/png" multiple @input="handleFileInput" @click="approveUpload == ''" />
        </label>

        <Transition>
            <div v-if="files.length !== 0" class="flex flex-col gap-4">
                <Button variant="outline" @click="uploadFiles">Upload</Button>
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
        </Transition>

        <Transition>
            <div
                v-if="files.length !== 0 && files.length <= 10"
                id="previewContainerUpload"
                class="flex flex-wrap overflow-y-scroll bg-card rounded-md border p-4"
                :style="`max-height: ${maxHeight}px;`">
                <CharsDisplayUpload v-for="file in files" :key="file.name" :content="file.content" @remove="removeFile(file.name)" />
            </div>
            <p v-else-if="files.length !== 0" class="text-sm text-center text-muted-foreground">Too many files selected for preview.</p>
        </Transition>

        <div v-if="approveUpload !== ''">
            <p class="text-center">{{ approveUpload }}</p>
        </div>
    </div>
</template>

<style scoped>
.links {
    display: grid;
    margin-block: 1em;
    gap: 1em;
}

.links a {
    padding: 0.5em 1em;
    background: lightgreen;
    border-radius: 0.3em;
    text-decoration: none;
    color: black;
}

.drag-active {
    background-color: hsl(var(--accent));
}
</style>
