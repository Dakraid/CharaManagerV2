export async function showCharacter(character: Character) {
    const nuxtApp = useNuxtApp();
    await nuxtApp.hooks.callHook('characters:menu', character.id);
}
