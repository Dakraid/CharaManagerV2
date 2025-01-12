<script setup lang="ts">
import type * as Cards from 'character-card-utils';
import dayjs from 'dayjs';
import { ImageUp, MessageSquarePlus, SendHorizontal, Trash2 } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';

const props = defineProps<{
    character: Character;
    definition: Cards.V2;
}>();

const { toast } = useToast();

const nuxtApp = useNuxtApp();
const appStore = useAppStore();
const runtimeConfig = useRuntimeConfig();

const imageUri = runtimeConfig.public.imageDomain.endsWith('/')
    ? `${runtimeConfig.public.imageDomain}full/${props.character.id}.png`
    : `${runtimeConfig.public.imageDomain}/full/${props.character.id}.png`;

const activeCharacter = ref<Character>(props.character);
const activeDefinition = ref<Cards.V2>(props.definition);

const newFile = ref('');
const characterDump = ref('');
const activeTab = ref('general');

useHead({
    title: `#${activeCharacter.value.id} - ${activeDefinition.value.data.name}`,
});

async function setContentHeight(payload: string | number) {
    activeTab.value = payload as string;

    if (activeTab.value === 'alternatives') {
        await nextTick();
        const scrollElement = document.getElementById('alt_greetings');
        if (scrollElement) {
            const parentElement = scrollElement.parentElement;

            if (parentElement) {
                scrollElement.style.maxHeight = `${parentElement.offsetHeight - 100}px`;
            }
        }

        return;
    }

    if (activeTab.value === 'general') {
        await nextTick();
        const scrollElement = document.getElementById('general');
        if (scrollElement) {
            const parentElement = scrollElement.parentElement;

            if (parentElement) {
                scrollElement.style.maxHeight = `${parentElement.offsetHeight}px`;
            }
        }

        return;
    }
}

async function addGreeting() {
    activeDefinition.value.data.alternate_greetings.push('');
}

async function navigateHome() {
    await navigateTo({
        path: `/`,
    });
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
                id: activeCharacter.value.id,
                newImage: newFile.value,
            },
        });

        if (!data.value) {
            throw new Error('No E-Tag returned');
        }

        activeCharacter.value.etag = data.value;
    } catch (err: any) {
        toast({
            title: 'Failed to save definition',
            description: err.message,
            variant: 'destructive',
        });
    }

    await clearFileInput(document.getElementById('file-input'));
    await nuxtApp.hooks.callHook('characters:refresh');
}

async function deleteActiveCharacter() {
    await deleteCharacter(activeCharacter.value);
    await navigateHome();
}

async function saveActiveDefinition() {
    try {
        await useFetch('/api/defs/definition', {
            method: 'PATCH',
            body: {
                id: activeCharacter.value.id,
                definition: JSON.stringify(activeDefinition.value),
            },
        });
    } catch (err: any) {
        toast({
            title: 'Failed to save definition',
            description: err.message,
            variant: 'destructive',
        });
    }

    toast({
        title: 'Success',
        description: 'Definition was updated.',
    });
}

onMounted(async () => {
    await setContentHeight('general');
    window.addEventListener('resize', async () => await setContentHeight(activeTab.value));
});
</script>

<template>
    <div
        class="grid grid-cols-[1fr] justify-center justify-items-center items-center lg:grid-cols-[384px_1fr] gap-2 w-full h-full max-h-[calc(100vh_-_theme(spacing.16))] pr-4 lg:pr-0 overflow-y-scroll">
        <Card class="flex flex-col h-full max-h-[calc(100vh_-_theme(spacing.16))]">
            <CardHeader>
                <div class="flex flex-col gap-2">
                    <h1 class="text-muted-foreground text-center text-sm">Image Replacement</h1>
                    <Input id="file-input" ref="fileInput" type="file" name="file" accept="image/*" @input="handleFileInput" />
                    <Transition>
                        <Button v-if="newFile.trim() !== ''" type="submit" variant="secondary" class="flex-1" @click="uploadImage">
                            <span class="sr-only">Change image</span>
                            <ImageUp class="h-6 w-6" />
                        </Button>
                    </Transition>
                </div>
            </CardHeader>
            <CardContent class="flex-1 p-6 pt-0 pb-0 flex justify-center items-center">
                <NuxtImg
                    :id="character.etag"
                    :key="character.etag"
                    :src="imageUri"
                    :alt="character.charName"
                    format="webp"
                    :quality="100"
                    width="384"
                    height="576"
                    placeholder="Placeholder.png"
                    placeholder-class="h-[576ppx] w-[384px] bg-muted rounded-xl"
                    :class="cn('h-[576px] w-[384px] mx-auto object-cover rounded-xl transition-all', appStore.blurChars ? 'blur-2xl' : '')" />
            </CardContent>
            <CardFooter class="p-6 min-h-10">
                <div class="h-10"></div>
            </CardFooter>
        </Card>
        <Card class="flex flex-col w-full h-full max-h-[calc(100vh_-_theme(spacing.16))]">
            <CardHeader class="p-6 pb-0">
                <CardDescription class="flex flex-col gap-2">
                    <div class="flex justify-between gap-2">
                        <p class="text-muted-foreground">#{{ activeCharacter.id }}</p>
                        <p class="text-muted-foreground">{{ dayjs(activeCharacter.uploadDate).format('DD.MM.YYYY HH:mm:ss') }}</p>
                    </div>
                </CardDescription>
                <CardTitle>
                    <Input v-model="activeDefinition.data.name" />
                </CardTitle>
            </CardHeader>
            <CardContent class="flex-1 p-6 pt-2 pb-2">
                <Tabs default-value="general" class="w-full h-full max-h-full overflow-y-clip" @update:model-value="setContentHeight">
                    <TabsList class="w-full flex flex-col lg:flex-row justify-around">
                        <TabsTrigger class="flex-1 w-full" value="general"> General</TabsTrigger>
                        <TabsTrigger class="flex-1 w-full" value="alternatives"> Alternative Greetings</TabsTrigger>
                        <TabsTrigger class="flex-1 w-full" value="examples"> Message Examples</TabsTrigger>
                        <TabsTrigger class="flex-1 w-full" value="prompts"> Prompt Overrides</TabsTrigger>
                        <TabsTrigger class="flex-1 w-full" value="creator"> Creator Metadata</TabsTrigger>
                        <TabsTrigger
                            class="flex-grow"
                            value="json"
                            @click="
                                () => {
                                    characterDump = JSON.stringify(activeDefinition.data, null, 4);
                                }
                            ">
                            JSON Dump
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent :class="cn('grid grid-rows-[1fr] gap-2 h-[calc(100%-48px)]', activeTab === 'general' ? 'grid' : 'hidden')" value="general">
                        <ScrollArea id="general" class="height-fix">
                            <div class="grid grid-rows-[min-content_1fr_min-content_1fr_min-content_1fr_min-content_1fr] gap-2 h-full pr-4">
                                <Label for="description">Description</Label>
                                <Textarea id="description" v-model="activeDefinition.data.description" spellcheck="true" />

                                <Label for="first_message">First Message</Label>
                                <Textarea id="first_message" v-model="activeDefinition.data.first_mes" spellcheck="true" />

                                <Label for="personality">Personality</Label>
                                <Textarea id="personality" v-model="activeDefinition.data.personality" spellcheck="true" />

                                <Label for="scenario">Scenario</Label>
                                <Textarea id="scenario" v-model="activeDefinition.data.scenario" spellcheck="true" />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent
                        :class="cn('grid grid-rows-[min-content_min-content_1fr] gap-2 h-[calc(100%-48px)]', activeTab === 'alternatives' ? 'grid' : 'hidden')"
                        value="alternatives">
                        <Button id="save" type="submit" variant="outline" @click="addGreeting">
                            <span class="sr-only">Add Greeting</span>
                            <MessageSquarePlus class="h-6 w-6" />
                        </Button>
                        <Label for="alt_greetings">Alternative Greetings</Label>
                        <ScrollArea id="alt_greetings" class="height-fix">
                            <div class="grid gap-2 h-full pr-4" :style="`grid-template-rows: repeat(${activeDefinition.data.alternate_greetings.length}, 1fr)`">
                                <Textarea
                                    v-for="(item, index) in activeDefinition.data.alternate_greetings"
                                    :key="item"
                                    v-model="activeDefinition.data.alternate_greetings[index]"
                                    class="h-full"
                                    spellcheck="true" />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent :class="cn('grid grid-rows-[min-content_1fr] gap-2 h-[calc(100%-48px)]', activeTab === 'examples' ? 'grid' : 'hidden')" value="examples">
                        <Label for="examples">Message Examples</Label>
                        <Textarea id="examples" v-model="activeDefinition.data.mes_example" class="resize-none" spellcheck="true" />
                    </TabsContent>
                    <TabsContent
                        :class="cn('grid grid-rows-[min-content_1fr_min-content_1fr] gap-2 h-[calc(100%-48px)]', activeTab === 'prompts' ? 'grid' : 'hidden')"
                        value="prompts">
                        <Label for="system_prompt">System Prompt</Label>
                        <Textarea id="system_prompt" v-model="activeDefinition.data.system_prompt" class="resize-none" spellcheck="true" />

                        <Label for="post_history_instructions">Jailbreak</Label>
                        <Textarea id="post_history_instructions" v-model="activeDefinition.data.post_history_instructions" class="resize-none" />
                    </TabsContent>
                    <TabsContent
                        :class="
                            cn(
                                'grid grid-rows-[min-content_min-content_min-content_1fr_min-content_min-content] gap-2 h-[calc(100%-48px)]',
                                activeTab === 'creator' ? 'grid' : 'hidden'
                            )
                        "
                        value="creator">
                        <Label for="creator_name">Creator</Label>
                        <Input id="creator_name" v-model="activeDefinition.data.creator" />

                        <Label for="creator_notes">Creator Notes</Label>
                        <Textarea id="creator_notes" v-model="activeDefinition.data.creator_notes" class="resize-none" spellcheck="true" />

                        <Label for="character_version">Character Version</Label>
                        <Input id="character_version" v-model="activeDefinition.data.character_version" />

                        <Label for="character_tags">Tags</Label>
                        <TagsInput v-model="activeDefinition.data.tags" if="character_tags" class="flex-grow">
                            <TagsInputItem v-for="item in activeDefinition.data.tags" :key="item" :value="item">
                                <TagsInputItemText />
                                <TagsInputItemDelete />
                            </TagsInputItem>
                            <TagsInputInput placeholder="Add Tag..." />
                        </TagsInput>
                    </TabsContent>
                    <TabsContent :class="cn('grid grid-rows-[min-content_1fr] gap-2 h-[calc(100%-48px)]', activeTab === 'json' ? 'grid' : 'hidden')" value="json">
                        <Label for="json">JSON Dump</Label>
                        <Textarea id="json" v-model="characterDump" class="resize-none" disabled />
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                <div class="w-full flex justify-between items-center">
                    <Button type="submit" variant="destructive" @click="deleteActiveCharacter">
                        <span class="sr-only">Delete</span>
                        <Trash2 class="h-6 w-6" />
                    </Button>
                    <Button type="submit" variant="secondary" @click="saveActiveDefinition">
                        <span class="sr-only">Save</span>
                        <SendHorizontal class="h-6 w-6" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    </div>
</template>

<style scoped></style>
