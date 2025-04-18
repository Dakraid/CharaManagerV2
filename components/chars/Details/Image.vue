<script setup lang="ts">
import { ImageUp, Pencil } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';

const { toast } = useToast();

const props = defineProps<{
    character: Character;
    eTag: string;
}>();
defineEmits(['edit']);

const appStore = useAppStore();
const runtimeConfig = useRuntimeConfig();

const imageUri = runtimeConfig.public.imageDomain.endsWith('/')
    ? `${runtimeConfig.public.imageDomain}full/${props.character.id}.png`
    : `${runtimeConfig.public.imageDomain}/full/${props.character.id}.png`;

const newFile = ref('');

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

async function handleFileInput(event: any) {
    if (!event.target.files || event.target.files.length === 0) {
        console.error('No file selected');
        return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {
        if (e.target && e.target.result) {
            newFile.value = e.target.result.toString();
        }
    };

    reader.onerror = (e) => {
        console.error('Error reading file:', e);
    };

    reader.readAsDataURL(file);
}

async function uploadImage() {
    try {
        const { data } = await useFetch<string>('/api/img/image', {
            method: 'PUT',
            body: {
                id: props.character.id,
                newImage: newFile.value,
            },
        });

        if (!data.value) {
            throw new Error('No E-Tag returned');
        }
    } catch (err: any) {
        toast({
            title: 'Failed to save definition',
            description: err.message,
            variant: 'destructive',
        });
    }

    await clearFileInput(document.getElementById('file-input'));
}
</script>

<template>
    <Card class="flex flex-col w-full h-min max-h-[calc(100vh_-_theme(spacing.16))] lg:max-w-[434px] lg:h-full">
        <CardHeader>
            <div class="flex flex-col gap-2">
                <h1 class="text-center text-sm text-muted-foreground">Image Replacement</h1>
                <Input id="file-input" ref="fileInput" accept="image/*" name="file" type="file" @input="handleFileInput" />
                <Transition>
                    <Button v-if="newFile.trim() !== ''" class="flex-1" type="submit" variant="secondary" @click="uploadImage">
                        <span class="sr-only">Change image</span>
                        <ImageUp class="h-6 w-6" />
                    </Button>
                </Transition>
            </div>
        </CardHeader>
        <CardContent class="flex flex-1 items-center justify-center p-6 pt-0 pb-0">
            <div class="Viewer">
                <NuxtImg
                    :id="eTag"
                    :key="eTag"
                    :alt="character.charName"
                    :class="cn('Image h-[576px] mx-auto object-cover rounded-xl transition-all', appStore.blurChars ? 'blur-2xl' : '')"
                    :quality="100"
                    :src="imageUri"
                    format="png"
                    height="576"
                    placeholder="Placeholder.png"
                    placeholder-class="Image rounded-xl h-[576px] bg-muted"
                    width="384" />
                <Button variant="secondary" size="icon" class="h-full w-full rounded-full Button" @click="$emit('edit')">
                    <Pencil class="z-10 h-4 w-4" />
                </Button>
            </div>
        </CardContent>
        <CardFooter class="p-6 min-h-10">
            <div class="h-10"></div>
        </CardFooter>
    </Card>
</template>

<style scoped>
.Viewer {
    display: grid;
    grid-template-columns: 1fr 2rem 0.25rem;
    grid-template-rows: 0.25rem 2rem 1fr;
    gap: 0;
}

.Image {
    grid-area: 1 / 1 / 4 / 4;
}

.Button {
    grid-area: 2 / 2 / 3 / 3;
}
</style>
