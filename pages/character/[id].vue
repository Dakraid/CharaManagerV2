<script setup lang="ts">
import { getEditorDefaults } from '@pqina/pintura';
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/vue-pintura';
import { Undo2 } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value?.user) {
            return navigateTo('/authenticate');
        }
    },
});

characterStore.loadedCharacter = undefined;

const showEditor = ref(false);
const inlineSrc = ref();

async function displayEditor() {
    showEditor.value = true;
}

const editorProps = {
    imageCropAspectRatio: 384 / 576,
    ...getEditorDefaults(),
};

const handleInlineLoad = (event: any) => {
    // Empty for now
};

const handleInlineProcess = async (event: any) => {
    showEditor.value = false;

    try {
        const { data } = await useFetch<string>('/api/img/image', {
            method: 'PUT',
            body: {
                id: characterStore.loadedCharacter!.character.id,
                newImage: await blobToBase64(event.detail.dest),
            },
        });

        if (!data.value) {
            throw new Error('No E-Tag returned');
        }

        characterStore.loadedCharacter!.character.etag = data.value;
    } catch (err: any) {
        toast({
            title: 'Failed to save definition',
            description: err.message,
            variant: 'destructive',
        });
    }
};

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

onMounted(async () => {
    if (validateIdRouteParameter(route) && (characterStore.loadedCharacter === undefined || characterStore.loadedCharacter.character.id !== Number(route.params.id))) {
        await characterStore.fetchCharacterWithDef(Number(route.params.id));

        inlineSrc.value = runtimeConfig.public.imageDomain.endsWith('/')
            ? `${runtimeConfig.public.imageDomain}full/${characterStore.loadedCharacter!.character.id}.png`
            : `${runtimeConfig.public.imageDomain}/full/${characterStore.loadedCharacter!.character.id}.png`;
    }

    if (!characterStore.loadedCharacter) {
        showError('No character loaded');
    }
});
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-if="characterStore.isFetching && characterStore.loadedCharacter === undefined" />
        <CommonError v-else-if="!characterStore.isFetching && characterStore.loadedCharacter === undefined" error="Character not found" class="rounded-xl" />
        <PinturaEditor
            v-else-if="!characterStore.isFetching && characterStore.loadedCharacter && showEditor"
            v-bind="editorProps"
            :src="inlineSrc"
            @pintura:load="handleInlineLoad($event)"
            @pintura:process="handleInlineProcess($event)" />
        <div v-else class="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 lg:flex-nowrap">
            <div class="flex flex-col w-full h-full items-center justify-center gap-2 overflow-y-auto flex-nowrap lg:max-w-[434px]">
                <Button id="clear" type="submit" variant="outline" class="w-full" @click="$router.back()">
                    <span class="sr-only">Back</span>
                    <Undo2 class="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <CharsDetailsImage @edit="displayEditor" />
            </div>
            <CharsDetailsEditor />
        </div>
    </Transition>
</template>

<style>
.pintura-editor {
    --color-background: 255, 255, 255;
    --color-foreground: 0, 0, 0;
}

@media (prefers-color-scheme: dark) {
    .pintura-editor {
        --color-background: 0, 0, 0;
        --color-foreground: 255, 255, 255;
    }
}
</style>
