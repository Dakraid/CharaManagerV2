import dayjs from 'dayjs';
import { eq, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createHash } from 'node:crypto';
import { inputImageToCharacter } from '~/server/utils/CharacterUtilities';
import getEmbeddings from '~/server/utils/EmbeddingUtilities';

function isDigitString(input: string): boolean {
    const regex = /^\d{13}$/;
    return regex.test(input);
}

async function processUpdatedCharacter(
    db: NodePgDatabase,
    embedderProvider: any,
    personalityToCreatorNotes: boolean,
    update: {
        id: number;
        file: string;
        sourceUri: string | null;
        fileName: string;
        charName: string | null;
        etag: string | null;
        uploadDate: string;
        hash: string;
        public: boolean;
        ownerId: number | null;
    }
): Promise<DefinitionRow | undefined> {
    try {
        const card = await inputImageToCharacter(update.file);

        if (card === undefined) {
            throw new Error('Failed to convert image to character card.');
        }

        if (personalityToCreatorNotes) {
            card.data.creator_notes = card.data.personality;
            card.data.personality = '';
        }

        const tokens = await getTokenCounts(card);
        const embedding = await getEmbeddings(card, embedderProvider);

        const cardJson = JSON.stringify(card);
        const hash = createHash('sha256').update(cardJson).digest('hex');

        await db.update(characters).set({ charName: card.data.name }).where(eq(characters.id, update.id));

        return {
            id: update.id,
            definition: cardJson,
            hash: hash,
            embedding: embedding,
            tokensTotal: tokens.tokensTotal,
            tokensPermanent: tokens.tokensPermanent,
        };
    } catch (err: any) {
        console.error(err);
    }
}

export default defineEventHandler(async (event) => {
    await Authenticate(event);
    const db = event.context.$db;

    if (!db) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Database not initialized',
        });
    }

    const embedderProvider = event.context.$embedder;
    if (!embedderProvider) {
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: 'Embedder not initialized',
        });
    }

    const fileRows: FileRow[] = [];
    let result: { id: number }[] = [];
    let hasDuplicates = false;

    const { files, personalityToCreatorNotes } = await readBody<{ files: FileUpload[]; personalityToCreatorNotes: boolean }>(event);

    await db.transaction(async (tx) => {
        for (const file of files) {
            try {
                const hash = createHash('sha256').update(file.content).digest('hex');
                if (fileRows.some((f) => f.hash === hash)) {
                    continue;
                }
                if (isDigitString(file.lastModified)) {
                    fileRows.push({
                        file: file.content,
                        fileName: file.name,
                        uploadDate: dayjs(Number(file.lastModified)).format('YYYY-MM-DD HH:mm:ss'),
                        hash: hash,
                        etag: hash,
                        sourceUri: file.sourceUri,
                    });
                } else {
                    fileRows.push({
                        file: file.content,
                        fileName: file.name,
                        uploadDate: dayjs(file.lastModified).format('YYYY-MM-DD HH:mm:ss'),
                        hash: hash,
                        etag: hash,
                        sourceUri: file.sourceUri,
                    });
                }
            } catch (err: any) {
                console.error(err);
            }
        }

        const duplicates = await db
            .select({ hash: characters.hash })
            .from(characters)
            .where(
                inArray(
                    characters.hash,
                    fileRows.map((f) => f.hash)
                )
            );

        const cleaned = fileRows.filter((file) => duplicates.every((duplicate) => duplicate.hash !== file.hash));

        if (cleaned.length === 0) {
            return 'No new files or all files are duplicates.';
        }

        if (fileRows.length > cleaned.length) {
            hasDuplicates = true;
        }

        try {
            result = await tx.insert(characters).values(cleaned).returning();
        } catch (err: any) {
            console.error(err);
            tx.rollback();
            throw createError({
                statusCode: StatusCode.INTERNAL_SERVER_ERROR,
                statusMessage: err.message,
            });
        }
    });

    if (result.length === 0) {
        return 'No new files or all files are duplicates.';
    }

    let updated: {
        id: number;
        file: string;
        sourceUri: string | null;
        fileName: string;
        charName: string | null;
        etag: string | null;
        uploadDate: string;
        hash: string;
        public: boolean;
        ownerId: number | null;
    }[] = [];

    await db.transaction(async (tx2) => {
        updated = await db
            .select()
            .from(characters)
            .where(
                inArray(
                    characters.id,
                    result.flatMap((i) => i.id)
                )
            );

        if (updated.length === 0) {
            return 'No new files or all files are duplicates.';
        }

        const results = await Promise.all(
            updated.map((update) => {
                return processUpdatedCharacter(db, embedderProvider, personalityToCreatorNotes, update);
            })
        );

        await tx2.insert(definitions).values(results.filter((i) => i !== undefined).flat());
    });

    const p1 = runTask('images:generate', { payload: { images: updated } });
    const p2 = runTask('ratings:generate', { payload: {} });
    await Promise.all([p1, p2]);

    if (hasDuplicates) {
        return 'Successfully uploaded files. Some files have been skipped due to being duplicates.';
    }

    return 'Successfully uploaded files.';
});
