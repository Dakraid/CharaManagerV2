<script setup lang="ts">
import dayjs from 'dayjs';
import { BrainCircuit, MessageSquarePlus, SendHorizontal, Trash2 } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const characterStore = useCharacterStore();

const selectedEditor = ref('general');
const jsonDump = ref(JSON.stringify(characterStore.loadedCharacter!.definition.data, null, 4));

const previousContent = ref<{
    description: string;
    first_mes: string;
    personality: string;
    scenario: string;
    alternate_greetings: string[];
}>({ description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] });

async function navigateHome() {
    await navigateTo({
        path: `/`,
    });
}

async function addGreeting() {
    characterStore.loadedCharacter!.definition.data.alternate_greetings.push('');
}

async function saveActiveDefinition() {
    characterStore.isFetching = true;
    try {
        await useFetch('/api/defs/definition', {
            method: 'PATCH',
            body: {
                id: characterStore.loadedCharacter!.character.id,
                definition: JSON.stringify(characterStore.loadedCharacter!.definition),
            },
        });
    } catch (err: any) {
        toast({
            title: 'Failed to save definition',
            description: err.message,
            variant: 'destructive',
        });

        characterStore.isFetching = false;
        return;
    }

    toast({
        title: 'Success',
        description: 'Definition was updated.',
    });

    previousContent.value = { description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] };
    characterStore.isFetching = false;
}

async function deleteActiveCharacter() {
    await deleteCharacter(characterStore.loadedCharacter!.character);
    await navigateHome();
}

async function deleteAlternativeMessage(index: number) {
    characterStore.loadedCharacter!.definition.data.alternate_greetings.splice(index, 1);
}

async function setContentHeight() {
    if (selectedEditor.value === 'alternatives') {
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

    if (selectedEditor.value === 'general') {
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

async function llmEdit(source: string, content: string, type: number, source_index: number = 0) {
    const response = await $fetch<{ source: string; content: string }>('/api/llm/edit', {
        method: 'POST',
        body: {
            source: source,
            content: content,
            type: type,
        },
    });

    if (!response?.content) {
        return undefined;
    }

    switch (source) {
        case 'description':
            previousContent.value.description = content;
            break;
        case 'first_mes':
            previousContent.value.first_mes = content;
            break;
        case 'personality':
            previousContent.value.personality = content;
            break;
        case 'scenario':
            previousContent.value.scenario = content;
            break;
        case 'alternate_greetings':
            previousContent.value.alternate_greetings[source_index] = content;
            break;
    }
    return response.content;
}

async function generalLlmEdit() {
    characterStore.isFetching = true;
    const newDesc = await llmEdit('description', characterStore.loadedCharacter!.definition.data.description, 1);
    if (newDesc) {
        characterStore.loadedCharacter!.definition.data.description = newDesc;
    }

    if (characterStore.loadedCharacter!.definition.data.first_mes.trim().length > 10) {
        const newFirstMes = await llmEdit('first_mes', characterStore.loadedCharacter!.definition.data.first_mes, 2);
        if (newFirstMes) {
            characterStore.loadedCharacter!.definition.data.first_mes = newFirstMes;
        }
    }

    if (characterStore.loadedCharacter!.definition.data.personality.trim().length > 10) {
        const newPersonality = await llmEdit('personality', characterStore.loadedCharacter!.definition.data.personality, 1);
        if (newPersonality) {
            characterStore.loadedCharacter!.definition.data.description = newPersonality;
        }
    }

    if (characterStore.loadedCharacter!.definition.data.scenario.trim().length > 10) {
        const newScenario = await llmEdit('scenario', characterStore.loadedCharacter!.definition.data.scenario, 1);
        if (newScenario) {
            characterStore.loadedCharacter!.definition.data.scenario = newScenario;
        }
    }
    characterStore.isFetching = false;
}

onMounted(async () => {
    await setContentHeight();
    window.addEventListener('resize', async () => await setContentHeight());
});
</script>

<template>
    <Card class="flex flex-col w-full max-h-[calc(100vh_-_theme(spacing.16))] h-full">
        <CardHeader class="flex flex-col p-6 pb-0">
            <CardTitle class="flex flex-row">
                <Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-r-none">#{{ characterStore.loadedCharacter!.character.id }}</Badge>
                <Input v-model="characterStore.loadedCharacter!.definition.data.name" class="z-10 rounded-none border-x-0" />
                <Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-l-none">
                    {{ dayjs(characterStore.loadedCharacter!.character.uploadDate).format('DD.MM.YYYY HH:mm:ss') }}
                </Badge>
            </CardTitle>
            <CardDescription>
                <Select v-model="selectedEditor" default-value="general">
                    <SelectTrigger>
                        <SelectValue placeholder="Select an editor block" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectLabel>Editor Blocks</SelectLabel>
                        <SelectGroup>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="alternatives">Alternative Greetings</SelectItem>
                            <SelectItem value="examples">Message Examples</SelectItem>
                            <SelectItem value="prompts">Prompt Overrides</SelectItem>
                            <SelectItem value="creator">Creator Metadata</SelectItem>
                            <SelectItem value="dump">JSON Dump</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardDescription>
        </CardHeader>
        <CardContent class="flex h-full items-center justify-center overflow-hidden px-6 py-2">
            <Transition name="fade" mode="out-in">
                <ScrollArea v-if="selectedEditor === 'general'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <div class="mb-8 h-full flex-1">
                        <Label for="description" class="mb-4 text-xl">Description</Label>
                        <div class="flex flex-row gap-2 h-full w-full">
                            <Textarea id="description" v-model="characterStore.loadedCharacter!.definition.data.description" spellcheck="true" class="h-full w-full" />
                            <Textarea
                                v-if="previousContent.description.trim().length > 10"
                                id="description_old"
                                v-model="previousContent.description"
                                spellcheck="true"
                                class="h-full w-full" />
                        </div>
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="first_message" class="mb-4 text-xl">First Message</Label>
                        <div class="flex flex-row gap-2 h-full w-full">
                            <Textarea id="first_message" v-model="characterStore.loadedCharacter!.definition.data.first_mes" spellcheck="true" class="h-full" />
                            <Textarea
                                v-if="previousContent.first_mes.trim().length > 10"
                                id="first_message_old"
                                v-model="previousContent.first_mes"
                                contenteditable="false"
                                class="h-full w-full" />
                        </div>
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="personality" class="mb-4 text-xl">Personality</Label>
                        <div class="flex flex-row gap-2 h-full w-full">
                            <Textarea id="personality" v-model="characterStore.loadedCharacter!.definition.data.personality" spellcheck="true" class="h-full" />
                            <Textarea
                                v-if="previousContent.personality.trim().length > 10"
                                id="personality_old"
                                v-model="previousContent.personality"
                                contenteditable="false"
                                class="h-full w-full" />
                        </div>
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="scenario" class="mb-4 text-xl">Scenario</Label>
                        <div class="flex flex-row gap-2 h-full w-full">
                            <Textarea id="scenario" v-model="characterStore.loadedCharacter!.definition.data.scenario" spellcheck="true" class="h-full" />
                            <Textarea
                                v-if="previousContent.scenario.trim().length > 10"
                                id="scenario_old"
                                v-model="previousContent.scenario"
                                contenteditable="false"
                                class="h-full w-full" />
                        </div>
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'alternatives'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <Label for="alt_greetings" class="my-2 text-xl">Alternative Greetings</Label>
                    <Button id="save" type="submit" variant="outline" class="my-2" @click="addGreeting">
                        <span class="sr-only">Add Greeting</span>
                        <MessageSquarePlus class="h-6 w-6" />
                    </Button>
                    <ScrollArea id="alt_greetings" class="height-fix">
                        <div
                            v-for="(item, index) in characterStore.loadedCharacter!.definition.data.alternate_greetings"
                            :key="item"
                            class="mb-2 grid h-full gap-2 grid-cols-[1fr_48px]">
                            <Textarea v-model="characterStore.loadedCharacter!.definition.data.alternate_greetings[index]" class="h-full" spellcheck="true" />
                            <Button
                                type="submit"
                                variant="outline"
                                class="h-full p-0 border-destructive text-destructive-foreground hover:bg-destructive/20"
                                @click="deleteAlternativeMessage(index)">
                                <span class="sr-only">Delete</span>
                                <Trash2 class="h-6 w-6 stroke-destructive" />
                            </Button>
                        </div>
                    </ScrollArea>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'examples'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <Label for="alt_greetings" class="mb-2 text-xl">Message Examples</Label>
                    <Textarea id="examples" v-model="characterStore.loadedCharacter!.definition.data.mes_example" spellcheck="true" class="h-full" />
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'prompts'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <div class="mb-8 h-full flex-1">
                        <Label for="system_prompt" class="mb-4 text-xl">System Prompt</Label>
                        <Textarea id="system_prompt" v-model="characterStore.loadedCharacter!.definition.data.system_prompt" spellcheck="true" class="h-full" />
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="post_history_instructions" class="mb-4 text-xl">Post History Instructions</Label>
                        <Textarea
                            id="post_history_instructions"
                            v-model="characterStore.loadedCharacter!.definition.data.post_history_instructions"
                            spellcheck="true"
                            class="h-full" />
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'creator'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <div class="mb-8 h-full flex-1">
                        <Label for="creator" class="mb-4 text-xl">Creator</Label>
                        <Textarea id="creator" v-model="characterStore.loadedCharacter!.definition.data.creator" spellcheck="true" class="h-full" />
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="creator_notes" class="mb-4 text-xl">Creator Notes</Label>
                        <Textarea id="creator_notes" v-model="characterStore.loadedCharacter!.definition.data.creator_notes" spellcheck="true" class="h-full" />
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="character_version" class="mb-4 text-xl">Creator Notes</Label>
                        <Textarea id="character_version" v-model="characterStore.loadedCharacter!.definition.data.character_version" spellcheck="true" class="h-full" />
                    </div>

                    <div class="mb-8 h-full flex-1">
                        <Label for="tags" class="mb-4 text-xl">Tags</Label>
                        <TagsInput v-model="characterStore.loadedCharacter!.definition.data.tags" if="character_tags">
                            <TagsInputItem v-for="item in characterStore.loadedCharacter!.definition.data.tags" :key="item" :value="item">
                                <TagsInputItemText />
                                <TagsInputItemDelete />
                            </TagsInputItem>
                            <TagsInputInput placeholder="Add Tag..." />
                        </TagsInput>
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'dump'" class="flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6 height-fix">
                    <div class="mb-8 h-full flex-1">
                        <Label for="json" class="mb-4 text-xl">JSON Dump</Label>
                        <Textarea id="json" v-model="jsonDump" spellcheck="true" class="h-full" />
                    </div>
                </ScrollArea>
            </Transition>
        </CardContent>
        <CardFooter>
            <div class="flex w-full items-center justify-between">
                <Button type="submit" variant="destructive" @click="deleteActiveCharacter">
                    <span class="sr-only">Delete</span>
                    <Trash2 class="h-6 w-24" />
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button type="submit" variant="secondary" @click="generalLlmEdit">
                                <span class="sr-only">Edit</span>
                                <BrainCircuit class="h-6 w-24" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <div class="flex justify-between gap-2">
                                <p>This actions tries to improve the given text using AI.</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button type="submit" variant="secondary" @click="saveActiveDefinition">
                    <span class="sr-only">Save</span>
                    <SendHorizontal class="h-6 w-24" />
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped></style>
