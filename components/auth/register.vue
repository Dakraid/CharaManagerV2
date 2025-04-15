<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const registerSchema = toTypedSchema(
    z.object({
        username: z.string().min(2).max(50),
        password: z.string().min(8),
    })
);

const isOpen = ref(false);

const { fetch, user } = useUserSession();

async function onSubmit(values: any) {
    try {
        const response = await useFetch('/api/auth/register', {
            method: 'POST',
            body: {
                username: values.username,
                password: values.password,
            },
        });

        if (response.error.value) {
            throw response.error.value;
        }

        await fetch();
        isOpen.value = false;

        toast({
            title: 'User registered.',
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
        <div class="grid w-full gap-2 text-center">
            <h1 class="text-3xl font-bold">Register</h1>
            <p class="text-balance text-muted-foreground">Enter your credentials below to register</p>
        </div>

        <Form :validation-schema="registerSchema" class="grid gap-2" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="username">
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="Username" required v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="********" required v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="mt-2 w-full"> Register</Button>
        </Form>
    </div>
</template>
