import { z } from 'zod';

export const queryIdSchema = z.object({
    id: z.coerce.number().int().positive().finite(),
});

export const queryPageSchema = z.object({
    page: z.coerce.number().int().positive().finite(),
    perPage: z.coerce.number().int().positive().finite(),
});

export const postVenusUriSchema = z.object({
    targetUri: z.union([z.string().url().includes('chub.ai'), z.string().url().includes('characterhub.org')]),
});

export const postJannyAiUriSchema = z.object({
    targetUri: z.string().url().includes('jannyai.com'),
});

export const postWyvernUriSchema = z.object({
    targetUri: z.string().url().includes('app.wyvern.chat'),
});
