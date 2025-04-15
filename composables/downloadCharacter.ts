import { useToast } from '~/components/ui/toast';

export async function downloadCharacter(character: Character) {
    const { toast } = useToast();
    try {
        const { data } = await useFetch('/api/chars/download', {
            method: 'GET',
            query: { id: character.id },
        });

        if (!data.value) {
            throw new Error('Character not found');
        }

        const anchor = document.createElement('a');
        anchor.href = data.value.card;
        anchor.download = data.value.name;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
}
