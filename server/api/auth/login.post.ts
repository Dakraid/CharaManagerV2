import { eq } from 'drizzle-orm';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const { username, password } = await readValidatedBody(
        event,
        z.object({
            username: z.string(),
            password: z.string().min(8),
        }).parse
    );

    const user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (!user) {
        throw createError({
            statusCode: StatusCode.UNAUTHORIZED,
            statusMessage: 'Invalid credentials',
        });
    }

    if (!(await verifyPassword(user.password, password))) {
        throw createError({
            statusCode: StatusCode.UNAUTHORIZED,
            statusMessage: 'Invalid credentials',
        });
    }

    await setUserSession(event, {
        user: {
            username,
        },
        loggedInAt: Date.now(),
    });
});
