<script setup lang="ts"></script>

<template>
    <Tabs id="control-tabs" default-value="file" class="w-full h-[calc(100vh_-_theme(spacing.36))]">
        <TabsList class="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="file"> File Upload</TabsTrigger>
            <TabsTrigger value="url"> URL Download</TabsTrigger>
        </TabsList>
        <TabsContent class="max-h-[calc(100%-48px)] grid grid-rows-[1fr] mt-0" value="file">
            <Card class="flex flex-col">
                <CardHeader>
                    <CardTitle class="text-center">File Upload</CardTitle>
                </CardHeader>
                <CardContent class="flex-1">
                    <CharsUpload />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent class="max-h-[calc(100%-48px)] grid grid-rows-[1fr] mt-0" value="url">
            <Card class="flex flex-col">
                <CardHeader>
                    <CardTitle class="text-center">Remote Char Download</CardTitle>
                </CardHeader>
                <CardContent class="flex-1">
                    <CharsDownload />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
</template>

<style scoped></style>
