import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { max } from 'drizzle-orm';
import _ from 'lodash';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import type { Statistics, StatisticsCache } from '~/utils/Interfaces';

async function getAuthorStats(characterDefs: any[]): Promise<[string, number][]> {
    const authorsGrouped = _.groupBy(characterDefs, 'creator');
    const authorStats: [string, number][] = [];
    _.forEach(authorsGrouped, function (value, key) {
        if (key.trim().length === 0) {
            const author = authorStats.find((s) => s[0] === 'Undefined');
            if (author) {
                author[1] += 1;
            } else {
                authorStats.push(['Undefined', 1]);
            }
            return;
        }
        if (key.includes('\r\n')) {
            const author = authorStats.find((s) => s[0] === key.split('\r\n')[0]);
            if (!author) {
                authorStats.push([key.split('\r\n')[0], value.length]);
            }
            return;
        }
        const author = authorStats.find((s) => s[0] === key);
        if (!author) {
            authorStats.push([key, value.length]);
        }
    });

    return authorStats.filter((x: [string, number]) => x[1] > 0).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
}

async function getTokenStats(characterDefs: any[]): Promise<[string, number][]> {
    const tokens: [string, number][] = [];
    characterDefs.forEach((char) => {
        tokens.push([char.name, char.description.length]);
    });

    return tokens.filter((x: [string, number]) => x[1] > 1).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
}

async function getDateStats(characterRows: any[]): Promise<[string, number][]> {
    dayjs.extend(customParseFormat);
    const datesGrouped = _.groupBy(characterRows, (char) => dayjs(char.uploadDate).format('DD/MM/YYYY'));
    const dates: [string, number][] = [];
    _.forEach(datesGrouped, function (value, key) {
        dates.push([key, value.length]);
    });

    return dates.sort((a: [string, number], b: [string, number]) => dayjs(a[0], 'DD-MM-YYYY').unix() - dayjs(b[0], 'DD-MM-YYYY').unix());
}

async function getTagStats(tagRows: any[]): Promise<[string, number][]> {
    const tags = tagRows
        .filter((item): item is { tag: string; usageCount: number } => item.tag !== null && item.usageCount !== null)
        .map(({ tag, usageCount }): [string, number] => [tag, usageCount]);

    return tags.sort((a, b) => b[1] - a[1]);
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

    const storage = createStorage({
        driver: fsDriver({ base: './cache' }),
    });

    const highestCharId = await db.select({ highest: max(characters.id) }).from(characters);
    const cachedStatistics = await storage.getItem<StatisticsCache>('statistics:cache');

    if (cachedStatistics && cachedStatistics.highestId === Number(highestCharId[0].highest)) {
        return cachedStatistics.statistics;
    }

    dayjs.extend(customParseFormat);
    const [characterRows, characterDefsRaw, tagRows] = await Promise.all([db.select().from(characters), db.select().from(definitions), db.select().from(tagCounts)]);

    const characterDefs = characterDefsRaw.map((def) => JSON.parse(def.definition).data);

    const [authorStats, tokens, dates, tags] = await Promise.all([getAuthorStats(characterDefs), getTokenStats(characterDefs), getDateStats(characterRows), getTagStats(tagRows)]);

    const result: Statistics = {
        charCount: characterRows.length,
        charTags: tags,
        charAuthors: authorStats,
        charDates: dates,
        charTokens: tokens,
    };

    await storage.setItem<StatisticsCache>('statistics:cache', { highestId: Number(highestCharId[0].highest), statistics: result });

    return result;
});
