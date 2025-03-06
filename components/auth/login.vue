<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const loginSchema = toTypedSchema(
    z.object({
        username: z.string().min(2).max(50),
        password: z.string().min(8),
    })
);

const { fetch, user } = useUserSession();

async function onSubmit(values: any) {
    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                username: values.username,
                password: values.password,
            },
        });

        await fetch();

        toast({
            title: 'User logged in.',
        });

        await navigateTo({
            path: '/',
        });
    } catch (err: any) {
        console.log(err);

        toast({
            title: err.data?.message || err.message,
            variant: 'destructive',
        });
    }
}
</script>

<template>
    <div>
        <div class="grid gap-2 text-center w-full">
            <h1 class="text-3xl font-bold">Login</h1>
            <p class="text-balance text-muted-foreground">Enter your credentials below to login</p>
        </div>

        <Form :validation-schema="loginSchema" class="grid gap-2" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="username">
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="Username" required v-bind="componentField" autocomplete="on" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="********" required v-bind="componentField" autocomplete="on" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="w-full mt-2"> Login</Button>
        </Form>
    </div>
</template>
