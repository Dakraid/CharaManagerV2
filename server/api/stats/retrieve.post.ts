import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import _ from 'lodash';
import type {Statistics, StatisticsCache} from '~/utils/Interfaces';
import {createStorage} from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import {max} from "drizzle-orm";

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
        driver: fsDriver({base: './cache'}),
    });

    const highestCharId = await db.select({highest: max(characters.id)}).from(characters);
    const cachedStatistics = await storage.getItem<StatisticsCache>("statistics:cache");

    if (cachedStatistics && cachedStatistics.highestId === Number(highestCharId[0].highest)) {
        return cachedStatistics.statistics;
    }

    const characterRows = await db.select().from(characters);
    const characterDefsRaw = await db.select().from(definitions);
    const characterDefs = characterDefsRaw.map((def) => JSON.parse(def.definition).data);

    const authorsGrouped = _.groupBy(characterDefs, 'creator');
    const authorStats: [string, number][] = [];
    _.forEach(authorsGrouped, function (value, key) {
        if (key.trim().length === 0) {
            const author = authorStats.find(s => s[0] === 'Undefined');
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

    const tokens: [string, number][] = [];
    characterDefs.forEach((char) => {
        tokens.push([char.name, char.description.length]);
    });

    const datesGrouped = _.groupBy(characterRows, (char) => dayjs(char.uploadDate).format('DD/MM/YYYY'));
    const dates: [string, number][] = [];
    _.forEach(datesGrouped, function (value, key) {
        dates.push([key, value.length]);
    });

    const tags = await db.select().from(tagCounts);
    const tagsRecord: [string, number][] = tags
        .filter((item): item is { tag: string; usageCount: number } =>
            item.tag !== null && item.usageCount !== null
        )
        .map(({tag, usageCount}) => [tag, usageCount]);

    dayjs.extend(customParseFormat);

    const result: Statistics = {
        charTags: tagsRecord.sort((a: any, b: any) => b.usageCount - a.usageCount),
        charCount: characterRows.length,
        charAuthors: authorStats.filter((x: any) => x.Count > 0).sort((a: any, b: any) => b.Count - a.Count),
        charDates: dates.sort((a: any, b: any) => dayjs(a.Date, 'DD-MM-YYYY').unix() - dayjs(b.Date, 'DD-MM-YYYY').unix()),
        charTokens: tokens.filter((x: any) => x.Tokens > 1).sort((a: any, b: any) => b.Tokens - a.Tokens),
    };

    await storage.setItem<StatisticsCache>("statistics:cache", {highestId: Number(highestCharId[0].highest), statistics: result});

    return result;
});
