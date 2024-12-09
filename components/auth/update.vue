<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useToast } from '~/components/ui/toast';

const { toast } = useToast();

const updateSchema = toTypedSchema(
    z.object({
        password: z.string().min(8),
    })
);

const isOpen = ref(false);

const { fetch, user } = useUserSession();

async function onSubmit(values: any) {
    try {
        const response = await useFetch('/api/auth/update', {
            method: 'POST',
            body: {
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
        <div class="grid gap-2 text-center w-full">
            <h1 class="text-3xl font-bold">Change Password</h1>
            <p class="text-balance text-muted-foreground">Enter your new password below.</p>
        </div>

        <Form :validation-schema="updateSchema" class="grid gap-2" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="********" required v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="w-full mt-2"> Change Password</Button>
        </Form>
    </div>
</template>
