import puppeteer, { Browser, Page } from "puppeteer";
import { app, clipboard } from "electron";
import { sleep } from "./utils";
import { playSound } from "./main";
import path from "path";
import { dir } from "console";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

let deepL: Page | null = null;
let google: Page | null = null;
let browser: Browser | null = null;

export async function closeBrowser() {
    if (browser) {
        await browser.close();
    }
}

export async function setupBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({ 
            headless: app.isPackaged
        });
    }
}

export async function copyResult(outputText: string) {
    let copyText = outputText;

    // 소리 재생
    playSound(path.join(app.getAppPath(), "complete.mp3"));

    clipboard.writeText(copyText);
    console.log('\n[Copy Output]');
    console.log(`"${copyText}"\n`);
}

export async function translate(src: string) {
    if (!browser) {
        await setupBrowser();
    }

    try {

        const resultDeepL = await translateDeepL(src);
        await copyResult(resultDeepL);
        
    } catch (err) {
        // 폴백 번역기: 구글 번역기
        console.warn(`failed to translate with DeepL. try google translator.`);
        console.error(err);

        try {

            const resultGoogle = await translateGoogle(src);
            await copyResult(resultGoogle);

        } catch (err2) {
            console.error(`failed to translate text.`);
        }
    }
}

export async function setupPage(page: Page) {
    const BLOCK_REQ = new Set(['font', 'image']);

    await page.setUserAgent(USER_AGENT);
    await page.setRequestInterception(true);

    page.on('request', req => {

        if (BLOCK_REQ.has(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }

    });

}

export async function translateDeepL(src: string) {

    const denyCookieButtonSelector = `button#cookie-banner-strict-accept-selected`;

    const sourceElementSelector = `d-textarea[name="source"]>div`;
    const outputElementSelector = `d-textarea[name="target"]`;

    if (!deepL) {

        deepL = await browser!.newPage()
        await setupPage(deepL);

        const url = `https://www.deepl.com/ko/translator#$ja/ko/`;
        console.log(`open DeepL: "${url}"`);

        await deepL.goto(url, { waitUntil: 'domcontentloaded' });
    }

    // 쿠키 거부 버튼 누르기
    try {
        await deepL.waitForSelector(denyCookieButtonSelector, { timeout: 1000 });
        await deepL.click(denyCookieButtonSelector);
    } catch {

    }

    // 입력칸 포커스
    await deepL.focus(sourceElementSelector);

    // 입력칸에 있는 모든 문자열 지우기
    await deepL.keyboard.down("ControlLeft");
    await deepL.keyboard.down("A");
    await deepL.keyboard.up("ControlRight");
    await deepL.keyboard.up("A");
    await deepL.keyboard.press("Backspace");

    // 입력칸에 번역할 문자열 입력
    await deepL.type(sourceElementSelector, src.trim(), { delay: 20 });

    // 번역 될 때 까지 대기
    await deepL.waitForSelector(outputElementSelector, { timeout: 5000 });
    await sleep(1500);

    // 출력 문자열
    const output = await deepL.$eval(outputElementSelector, el => el.textContent);

    if (output) {
        console.log(`translated: "${output}"`);
        return output;
    } else {

        // 번역된 문자열이 비어있으면 번역 실패
        throw `failed to translate with DeepL. (Translated output is empty.)`
    }
}

export async function translateGoogle(src: string) {

    const sourceInputSelector = `textarea[aria-label="원본 텍스트"]`;
    const resultSelector = `span.ryNqvb`;
    
    if(!google) {
        google = await browser!.newPage()
        await setupPage(google);

        await google.goto(`https://translate.google.co.kr/?sl=${"ja"}&tl=${"ko"}`, { waitUntil: 'domcontentloaded' });
    }

    await google.waitForSelector(sourceInputSelector, { timeout: 5000 });

    // 기존 입력란 지우기
    await google.focus(sourceInputSelector);
    await google.keyboard.down('ControlLeft');
    await google.keyboard.down('A');
    await google.keyboard.up('A');
    await google.keyboard.up('ControlLeft');
    await google.keyboard.press('Backspace');

    // 번역할 텍스트 입력
    await google.type(sourceInputSelector, src);

    await google.waitForNetworkIdle();

    const result = await google.$eval(resultSelector, el => el.textContent?.trim())

    console.log(`[Fallback] google translated: "${result}"`)

    return result;
}