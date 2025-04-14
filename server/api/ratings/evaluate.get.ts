export default defineEventHandler(async (event) => {
    await runTask('ratings:generate', { payload: { force: true } });
});
