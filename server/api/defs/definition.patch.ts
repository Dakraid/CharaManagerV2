import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';

export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const update = await readBody<Definition>(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const oldDefinition = await db.select().from(definitions).where(eq(definitions.id, update.id));

    if (!oldDefinition || oldDefinition.length === 0) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Definition not found',
        });
    }

    try {
        await db.insert(definitionHistory).values({
            definitionId: oldDefinition[0].id,
            prevDefinition: oldDefinition[0].definition,
            changedDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
    } catch (err: any) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }

    try {
        const hash = createHash('sha256').update(update.definition).digest('hex');
        await db.update(definitions).set({ definition: update.definition, hash: hash }).where(eq(definitions.id, update.id));
    } catch (err: any) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }

    const oldDef = JSON.parse(oldDefinition[0].definition);
    const newDef = JSON.parse(update.definition);

    if (oldDef.data.name !== newDef.data.name) {
        try {
            await db.update(characters).set({ charName: newDef.data.name }).where(eq(characters.id, update.id));
        } catch (err: any) {
            throw createError({
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
                statusMessage: err.message,
            });
        }
    }
});
