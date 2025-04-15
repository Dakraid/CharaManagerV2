<script setup lang="ts"></script>

<template>
    <div class="Container gap-2 h-[calc(100vh_-_theme(spacing.36))]">
        <Button type="submit" class="mt-2 w-full Button">Create New</Button>
        <Tabs id="control-tabs" default-value="file" class="w-full Controls">
            <TabsList class="mb-2 grid w-full grid-cols-2">
                <TabsTrigger value="file"> File Upload</TabsTrigger>
                <TabsTrigger value="url"> URL Download</TabsTrigger>
            </TabsList>
            <TabsContent class="max-h-[calc(100%-48px)] grid grid-rows-[1fr] mt-0" value="file">
                <Card class="flex flex-col">
                    <CardHeader>
                        <CardTitle class="text-center">File Upload</CardTitle>
                    </CardHeader>
                    <CardContent class="flex-1">
                        <CharsLocal />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent class="max-h-[calc(100%-48px)] grid grid-rows-[1fr] mt-0" value="url">
                <Card class="flex flex-col">
                    <CardHeader>
                        <CardTitle class="text-center">Remote Char Download</CardTitle>
                    </CardHeader>
                    <CardContent class="flex-1">
                        <CharsRemote />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
</template>

<style scoped>
.Container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    gap: 0.5rem;
    grid-template-areas:
        'Button'
        'Controls';
}

.Button {
    grid-area: Button;
}

.Controls {
    grid-area: Controls;
}
</style>
