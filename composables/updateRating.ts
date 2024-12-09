import { useToast } from '~/components/ui/toast';

export async function updateRating(character: Character, rating: number) {
    const { toast } = useToast();
    try {
        await useFetch('/api/chars/rating', {
            method: 'PATCH',
            body: {
                id: character.id,
                rating: rating,
            },
        });

        character.rating = rating;
    } catch (err: any) {
        toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
        });
    }
}
