import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event);

    if (!runtimeConfig.allowRegistration) {
        throw createError({
            statusCode: StatusCode.FORBIDDEN,
            statusMessage: 'Registration is disabled',
        });
    }

    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const userRows = await db.select().from(users);

    if (runtimeConfig.singleUserMode) {
        if (userRows.length >= 1) {
            throw createError({
                statusCode: StatusCode.FORBIDDEN,
                statusMessage: 'Single user mode is enabled, no further registrations are allowed.',
            });
        }
    }

    const { username, password } = await readValidatedBody(
        event,
        z.object({
            username: z.string(),
            password: z.string().min(8),
        }).parse
    );

    const hashedPassword = await hashPassword(password);

    await db.insert(users).values({ username: username, password: hashedPassword });

    await setUserSession(event, {
        user: {
            username,
        },
        loggedInAt: Date.now(),
    });
});
