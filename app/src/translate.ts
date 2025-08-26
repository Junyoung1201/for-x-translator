import puppeteer from "puppeteer-extra";
import {Page,Browser} from 'puppeteer';
import pStealth from 'puppeteer-extra-plugin-stealth';
import { sleep, waitForCondition } from "./utils/utils";
import { I_TranslatorOptions } from "./types/translate";
import { isDebug } from "./debug";

puppeteer.use(pStealth());

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

let deeplPage: Page | null = null;
let googlePage: Page | null = null;
let browser: Browser | null = null;

process.addListener('SIGINT', closeBrowser)

export function isBrowserClosed() {
    return !browser;
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        deeplPage = null;
        googlePage = null;
        browser = null;
        console.log("브라우저 종료");
    }
}

export async function ensureBrowser() {
    if (!browser || !browser?.connected) {
        browser = await puppeteer.launch({
            headless: !isDebug()
        })
        browser.on('disconnected', () => {
            browser = null;
        })
    }

    return browser;
}

export async function createPage() {
    const BLOCK_REQ = new Set(['font', 'image']);

    const browser = await ensureBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);
    await page.setRequestInterception(true);

    page.on('request', req => {

        if (BLOCK_REQ.has(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }

    });

    return page;
}

const DEF_OPTIONS: I_TranslatorOptions = {
    srcLang: "ja",
    destLang: "ko"
}

/*
    DeepL 번역
*/

let deeplTaskComplete = false;
let deeplResCheck = true;
let deeplTasking = false;

export async function translate_DeepL(srcText: string, {
    srcLang, destLang
}: I_TranslatorOptions = DEF_OPTIONS) {

    if(deeplTasking) {
        throw `이미 DeepL 번역 작업을 하고 있습니다.`
    }

    // 새로운 deepl 번역 요청 -> 변수 초기화
    deeplResCheck = true;
    deeplTaskComplete = false;
    deeplTasking = true;

    // deepL 접속
    if (!deeplPage) {
        deeplPage = await createPage();

        deeplPage.on('response', res => {
            // checking 값이 활성화되어 있을 때만 응답 처리
            if (deeplResCheck) {

                if (res.ok() && res.url().includes("/gatsby/") && res.url().endsWith(".json")) {
                    deeplTaskComplete = true;
                    deeplResCheck = false;
                }
            }
        })
    }

    const escapedSrcText = encodeURIComponent(srcText);

    try {

        // 페이지 접속
        await deeplPage.goto(`https://www.deepl.com/en/translator#${srcLang}/${destLang}/${escapedSrcText}`, { waitUntil: 'networkidle2' })

        await deeplPage.waitForNetworkIdle();

        // 번역 끝날떄까지 기다리기
        await waitForCondition(() => deeplTaskComplete, 7 * 1000);
        await sleep(350);

        const result = await deeplPage.$eval(`div[lang="ko"]:has(p)`, div => div.textContent.trim())

        return result;

    } catch (err) {

        throw err;

    } finally {
        deeplTasking = false;
    }
}

/*
    구글 번역
*/
let googleTasking = false;
let googleTaskComplete = false;
let googleResCheck = false;

export async function translate_Google(srcText: string, {
    srcLang, destLang
}: I_TranslatorOptions = DEF_OPTIONS) {

    if(googleTasking) {
        throw `이미 구글 번역 작업이 진행 중입니다.`
    }

    googleTaskComplete = false;
    googleTasking = true;
    googleResCheck = true;

    if(!srcText) {
        throw `번역할 텍스트가 없습니다.`
    }

    if(!googlePage) {
        googlePage = await createPage();
        googlePage.on('response', res => {
            if(googleResCheck) {
                if(res.ok() && res.url().includes("/data/batchexecute")) {
                    googleResCheck = false;
                    googleTaskComplete = true;
                }
            }
        })
    }

    const escpaedText = encodeURIComponent(srcText);

    try {

        await googlePage.goto(`https://translate.google.co.kr/?sl=${srcLang}&tl=${destLang}&text=${escpaedText}&op=translate`, { waitUntil: 'networkidle2' })

        // 번역 완료까지 기다리기
        await waitForCondition(() => googleTaskComplete, 5000);

        // 번역 결과 가져오기
        const result = await googlePage.$eval(`span.ryNqvb`, span => span.textContent?.trim() ?? "");

        return result;

    } catch (err: any) {
        console.error("구글 번역 실패:",err.message);
        throw err;
    } finally {
        googleTasking = false;
        googleTaskComplete = false;
    }

}