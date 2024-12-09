import { useToast } from '~/components/ui/toast';

export async function encryptByServer(apiKey: string): Promise<string | undefined> {
    try {
        const { data } = await useFetch<string>('/api/encrypt', {
            method: 'POST',
            body: {
                apiKey: apiKey,
            },
        });

        return data.value;
    } catch (err: any) {
        const { toast } = useToast();
        toast({
            title: 'Failed to secure API key.',
            description: err.message,
            variant: 'destructive',
        });
    }
}
