import * as Cards from 'character-card-utils';
import dayjs from 'dayjs';
import { eq, inArray } from 'drizzle-orm';
import { encode, isWithinTokenLimit } from 'gpt-tokenizer';
import { createHash } from 'node:crypto';

function isDigitString(input: string): boolean {
    const regex = /^\d{13}$/;
    return regex.test(input);
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

    await db.transaction(async (tx2) => {
        const updated = await db
            .select()
            .from(characters)
            .where(
                inArray(
                    characters.id,
                    result.flatMap((i) => i.id)
                )
            );

        const definitionRows: DefinitionRow[] = [];
        for (const update of updated) {
            try {
                const cleanedContent = await CleanCharacterBook(extractDefinition(update.file));
                const content = JSON.parse(cleanedContent);
                const card = Cards.parseToV2(content);

                if (personalityToCreatorNotes) {
                    card.data.creator_notes = card.data.personality;
                    card.data.personality = '';
                }

                const permanent = [card.data.description, card.data.personality];
                const total = [card.data.description, card.data.personality, card.data.first_mes];
                const tokensPermanent = encode(permanent.join('\n')).length;
                const tokensTotal = encode(total.join('\n')).length;

                const cardJson = JSON.stringify(card);
                const hash = createHash('sha256').update(cardJson).digest('hex');

                let embedding: number[] | undefined;
                if (isWithinTokenLimit(card.data.description, 8192)) {
                    embedding = await embedderProvider.embed(card.data.description);
                }

                definitionRows.push({ id: update.id, definition: cardJson, hash: hash, embedding: embedding, tokensTotal: tokensTotal, tokensPermanent: tokensPermanent });

                await db.update(characters).set({ charName: card.data.name }).where(eq(characters.id, update.id));
            } catch (err: any) {
                console.error(err);
            }
        }

        await runTask('images:generate', { payload: { images: updated } });
        await tx2.insert(definitions).values(definitionRows);
    });

    if (hasDuplicates) {
        return 'Successfully uploaded files. Some files have been skipped due to being duplicates.';
    }
    return 'Successfully uploaded files.';
});
