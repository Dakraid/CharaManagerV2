<script setup lang="ts">
import type * as Cards from 'character-card-utils';
import dayjs from 'dayjs';
import { MessageSquarePlus, SendHorizontal, Trash2 } from 'lucide-vue-next';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();
const character = defineModel<Character>('character', { required: true });
const definition = defineModel<Cards.V2>('definition', { required: true });

const selectedEditor = ref('general');
const jsonDump = ref(JSON.stringify(definition.value.data, null, 4));

async function navigateHome() {
    await navigateTo({
        path: `/`,
    });
}

async function addGreeting() {
    definition.value.data.alternate_greetings.push('');
}

async function saveActiveDefinition() {
    try {
        await useFetch('/api/defs/definition', {
            method: 'PATCH',
            body: {
                id: character.value.id,
                definition: JSON.stringify(definition.value),
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

async function deleteActiveCharacter() {
    await deleteCharacter(character.value);
    await navigateHome();
}

async function deleteAlternativeMessage(index: number) {
    definition.value.data.alternate_greetings.splice(index, 1);
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

onMounted(async () => {
    await setContentHeight();
    window.addEventListener('resize', async () => await setContentHeight());
});
</script>

<template>
    <Card class="flex flex-col w-full max-h-[calc(100vh_-_theme(spacing.16))] h-full">
        <CardHeader class="flex flex-col p-6 pb-0">
            <CardTitle class="flex flex-row">
                <Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-r-none">#{{ character.id }}</Badge>
                <Input v-model="definition.data.name" class="border-x-0 rounded-none z-10" />
                <Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-l-none">{{ dayjs(character.uploadDate).format('DD.MM.YYYY HH:mm:ss') }}</Badge>
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
        <CardContent class="flex items-center justify-center h-full px-6 py-2 overflow-hidden">
            <Transition name="fade" mode="out-in">
                <ScrollArea v-if="selectedEditor === 'general'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <div class="flex-1 h-full mb-8">
                        <Label for="description" class="text-xl mb-4">Description</Label>
                        <Textarea id="description" v-model="definition.data.description" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="first_message" class="text-xl mb-4">First Message</Label>
                        <Textarea id="first_message" v-model="definition.data.first_mes" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="personality" class="text-xl mb-4">Personality</Label>
                        <Textarea id="personality" v-model="definition.data.personality" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="scenario" class="text-xl mb-4">Scenario</Label>
                        <Textarea id="scenario" v-model="definition.data.scenario" spellcheck="true" class="h-full" />
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'alternatives'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <Label for="alt_greetings" class="text-xl my-2">Alternative Greetings</Label>
                    <Button id="save" type="submit" variant="outline" class="my-2" @click="addGreeting">
                        <span class="sr-only">Add Greeting</span>
                        <MessageSquarePlus class="h-6 w-6" />
                    </Button>
                    <ScrollArea id="alt_greetings" class="height-fix">
                        <div v-for="(item, index) in definition.data.alternate_greetings" :key="item" class="grid grid-cols-[1fr_48px] h-full gap-2 mb-2">
                            <Textarea v-model="definition.data.alternate_greetings[index]" class="h-full" spellcheck="true" />
                            <Button
                                type="submit"
                                variant="outline"
                                class="border-destructive text-destructive-foreground hover:bg-destructive/20 h-full p-0"
                                @click="deleteAlternativeMessage(index)">
                                <span class="sr-only">Delete</span>
                                <Trash2 class="h-6 w-6 stroke-destructive" />
                            </Button>
                        </div>
                    </ScrollArea>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'examples'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <Label for="alt_greetings" class="text-xl mb-2">Message Examples</Label>
                    <Textarea id="examples" v-model="definition.data.mes_example" spellcheck="true" class="h-full" />
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'prompts'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <div class="flex-1 h-full mb-8">
                        <Label for="system_prompt" class="text-xl mb-4">System Prompt</Label>
                        <Textarea id="system_prompt" v-model="definition.data.system_prompt" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="post_history_instructions" class="text-xl mb-4">Post History Instructions</Label>
                        <Textarea id="post_history_instructions" v-model="definition.data.post_history_instructions" spellcheck="true" class="h-full" />
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'creator'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <div class="flex-1 h-full mb-8">
                        <Label for="creator" class="text-xl mb-4">Creator</Label>
                        <Textarea id="creator" v-model="definition.data.creator" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="creator_notes" class="text-xl mb-4">Creator Notes</Label>
                        <Textarea id="creator_notes" v-model="definition.data.creator_notes" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="character_version" class="text-xl mb-4">Creator Notes</Label>
                        <Textarea id="character_version" v-model="definition.data.character_version" spellcheck="true" class="h-full" />
                    </div>

                    <div class="flex-1 h-full mb-8">
                        <Label for="tags" class="text-xl mb-4">Tags</Label>
                        <TagsInput v-model="definition.data.tags" if="character_tags">
                            <TagsInputItem v-for="item in definition.data.tags" :key="item" :value="item">
                                <TagsInputItemText />
                                <TagsInputItemDelete />
                            </TagsInputItem>
                            <TagsInputInput placeholder="Add Tag..." />
                        </TagsInput>
                    </div>
                </ScrollArea>
                <ScrollArea v-else-if="selectedEditor === 'dump'" class="flex flex-col gap-8 w-full h-full height-fix p-3 pr-6 border rounded-md">
                    <div class="flex-1 h-full mb-8">
                        <Label for="json" class="text-xl mb-4">JSON Dump</Label>
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
                <Button type="submit" variant="secondary" @click="saveActiveDefinition">
                    <span class="sr-only">Save</span>
                    <SendHorizontal class="h-6 w-24" />
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped></style>
