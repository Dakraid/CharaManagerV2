import { eq } from 'drizzle-orm';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const _session = await requireUserSession(event);

    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const { password } = await readValidatedBody(
        event,
        z.object({
            password: z.string().min(8),
        }).parse
    );

    const hashedPassword = await hashPassword(password);

    await db.update(users).set({ password: hashedPassword }).where(eq(users.username, _session.user.username));
});
