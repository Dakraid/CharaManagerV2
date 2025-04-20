<script setup lang="ts">
import { getEditorDefaults } from '@pqina/pintura';
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/vue-pintura';
import * as Cards from 'character-card-utils';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const characterStore = useCharacterStore();

definePageMeta({
    middleware() {
        const { loggedIn, session } = useUserSession();
        if (!loggedIn.value || !session.value.user) {
            return navigateTo('/authenticate');
        }
    },
});

const activeCharacter = ref<CharacterWithDef>();
const activeDefinition = ref<Cards.V2>();

const showEditor = ref(false);

async function displayEditor() {
    showEditor.value = true;
}

const inlineSrc = ref();
const inlineResult = ref();

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
                id: activeCharacter.value!.id,
                newImage: await blobToBase64(event.detail.dest),
            },
        });

        if (!data.value) {
            throw new Error('No E-Tag returned');
        }

        activeCharacter.value!.etag = data.value;
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
    if (validateIdRouteParameter(route) && activeCharacter.value === undefined) {
        const character = await $fetch<CharacterWithDef>('/api/chars/character', {
            method: 'GET',
            query: { id: route.params.id },
        });

        if (character) {
            activeCharacter.value = character;

            inlineSrc.value = runtimeConfig.public.imageDomain.endsWith('/')
                ? `${runtimeConfig.public.imageDomain}full/${activeCharacter.value.id}.png`
                : `${runtimeConfig.public.imageDomain}/full/${activeCharacter.value.id}.png`;

            let json;
            if (activeCharacter.value.definition.includes('\\"spec\\"')) {
                json = JSON.parse(JSON.parse(activeCharacter.value.definition));
            } else {
                json = JSON.parse(activeCharacter.value.definition);
            }

            activeDefinition.value = Cards.parseToV2(json);
        }
    }

    await characterStore.updateLoadingState(false);
});
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-if="(characterStore.appLoading || characterStore.isFetching) && activeCharacter === undefined" />
        <CommonError v-else-if="!(characterStore.appLoading || characterStore.isFetching) && activeCharacter === undefined" error="Character not found" class="rounded-xl" />
        <PinturaEditor
            v-else-if="!(characterStore.appLoading || characterStore.isFetching) && activeCharacter && showEditor"
            v-bind="editorProps"
            :src="inlineSrc"
            @pintura:load="handleInlineLoad($event)"
            @pintura:process="handleInlineProcess($event)" />
        <div v-else class="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 lg:flex-nowrap">
            <CharsDetailsImage v-if="activeCharacter" :character="activeCharacter" :e-tag="activeCharacter.etag" @edit="displayEditor" />
            <CharsDetailsEditor v-if="activeCharacter && activeDefinition" v-model:character="activeCharacter" v-model:definition="activeDefinition" />
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
