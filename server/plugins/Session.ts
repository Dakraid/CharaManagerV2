export default defineNitroPlugin(() => {
    sessionHooks.hook('fetch', async (session) => {
        session.extended = {
            fromHooks: true,
        };
    });

    sessionHooks.hook('clear', async (_session) => {
        console.log('User logged out');
    });
});
