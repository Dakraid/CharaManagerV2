import { useToast } from '~/components/ui/toast';

export async function deleteCharacter(character: Character) {
    const { toast } = useToast();
    const characterStore = useCharacterStore();
    try {
        const { data } = await useFetch('/api/chars/character', {
            method: 'DELETE',
            body: {
                id: character.id,
            },
        });

        toast({
            title: 'Success',
            description: data.value ?? '',
        });
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
    await characterStore.refreshCharacters();
}
