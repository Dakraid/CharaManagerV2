import fs from 'node:fs';
import playwright from 'playwright';
import { addExtra } from 'playwright-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dayjs from 'dayjs';

async function setupPlaywrightChromium(captchaSolverKey: string) {
    const chromium = addExtra(playwright.chromium);
    chromium.use(StealthPlugin());
    if (captchaSolverKey != '') {
        chromium.use(RecaptchaPlugin({ provider: { id: '2captcha', token: captchaSolverKey } }));
    }
    // For some reason dependency resolution fails by default, so we import the defaults here manually
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.app', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.csi', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.loadTimes', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.runtime', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/defaultArgs', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/iframe.contentWindow', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/media.codecs', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.hardwareConcurrency', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.languages', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.permissions', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.plugins', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.webdriver', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/sourceurl', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/user-agent-override', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/webgl.vendor', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/window.outerdimensions', StealthPlugin);
    return await chromium.launch({ headless: true });
}

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    await Authenticate(event);

    const runtimeConfig = useRuntimeConfig();

    const validatedBody = await readValidatedBody(event, body => postJannyAiUriSchema.safeParse(body));
    if (!validatedBody.success) {
        throw createError({
            statusCode: StatusCode.BAD_REQUEST,
            statusMessage: validatedBody.error.message,
        });
    }

    const characterFilename = validatedBody.data.targetUri.split('characters/')[1];

    try {
        const browser = await setupPlaywrightChromium(runtimeConfig.captchaSolverKey);
        const context = await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        });

        await page.goto(validatedBody.data.targetUri);
        await page.waitForURL(validatedBody.data.targetUri);
        await page.waitForTimeout(2000);
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Download")');
        await page.click('button:has-text("Download")');
        const download = await downloadPromise;
        await download.saveAs(`./temp/${characterFilename}.png`);
        await browser.close();
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.BAD_GATEWAY,
            statusMessage: err.message,
        });
    }

    let characterFile = '';
    try {
        characterFile = fs.readFileSync(`./temp/${characterFilename}.png`).toString('base64');
        fs.unlinkSync(`./temp/${characterFilename}.png`);
    } catch (err: any) {
        console.error(err);
        throw createError({
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
            statusMessage: err.message,
        });
    }

    if (characterFile.length > 0) {
        return {
            name: `${characterFilename}.png`,
            content: 'data:image/png;base64,' + characterFile,
            lastModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            sourceUri: validatedBody.data.targetUri,
        } as FileUpload;
    }

    throw createError({
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        statusMessage: 'Received no characters.',
    });
});
