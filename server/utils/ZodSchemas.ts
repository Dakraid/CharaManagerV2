import { z } from 'zod';

export const queryIdSchema = z.object({
    id: z.coerce.number().int().positive().finite(),
});

export const queryPageSchema = z.object({
    page: z.coerce.number().int().positive().finite(),
    perPage: z.coerce.number().int().positive().finite(),
});
