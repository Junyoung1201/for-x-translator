import fs from 'fs/promises';
import { I_StringLine } from "types/file-editor";
import { Config } from './config';
import { store } from 'store/store';
import { setGameDir, setSelectedFile } from 'store/game';
import { pathExistSync } from './fs';

export async function getStringListFromFile(file: string): Promise<I_StringLine[]> {
    console.log(`다음 파일을 로드 중: "${file}"`);

    try {
        const fileContent = await fs.readFile(file, 'utf-8');
        const newStringList: I_StringLine[] = [];

        for (let str of fileContent.split("\n")) {

            str = str.trim();

            // 아무것도 없는 줄은 건너뛰기
            if (!str || str.length === 0 || str === '#') {
                continue;
            }

            // 주석 처리
            if (str.startsWith("#")) {

                if (str.startsWith("# ")) {
                    str = str.slice(2, str.length);
                } else {
                    str = str.slice(1, str.length);
                }

                newStringList.push({
                    srcText: str,
                    destText: "",
                    comment: true
                })
                continue;
            }

            // 이스케이프 처리되지 않은 '=' 문자를 기준으로 원문과 번역문 나누기
            let srcText = "";
            let destText = "";

            for (let i = 0; i < str.length; i++) {
                if (str[i] === '=' && !(i - 1 >= 0 && str[i - 1] === '\\')) {
                    break;
                }

                srcText += str[i];
            }

            destText = str.slice(srcText.length + 1, str.length);

            newStringList.push({
                srcText, destText
            })
        }

        return newStringList;

    } catch (err) {
        throw err;
    }
}

export function openLastTranslationFile() {
    const { lastGameDir, lastTranslationFile } = Config.getConfig();

    if (lastGameDir) {

        if (!pathExistSync(lastGameDir)) {
            console.error(`마지막으로 작업한 게임 폴더를 찾을 수 없습니다. (경로: "${lastGameDir}")`)
            Config.setLastGameDir(undefined);
            Config.setLastTranslationFile(undefined);
            Config.saveConfig();
            return;
        }

        // state 업데이트
        store.dispatch(setGameDir(lastGameDir));

        if (lastTranslationFile) {
            store.dispatch(setSelectedFile(lastTranslationFile))
            console.log("마지막으로 작업한 번역 파일을 열었습니다:", lastTranslationFile);
        } else {
            console.log("마지막으로 작업했던 게임 폴더를 열었습니다:", lastGameDir);
        }

    }
}

/**
 *  I_StringLine[]을 특정 파일로 저장하기
 */
export async function saveFile(stringList: I_StringLine[], saveFile: string) {
    const lines: string[] = [];

    // I_StringLine[]을 
    for (let line of stringList) {
        let str = "";

        if (line.comment) {
            str = `#${line.srcText}`;
        } else {
            str = line.srcText + "=" + line.destText;
        }

        if (str && str !== '=') {
            lines.push(str);
        }
    }

    const fileContent = lines.join("\n");

    try {
        await fs.writeFile(saveFile, fileContent, "utf-8");
        console.log(`파일을 저장했습니다. (경로: "${saveFile}")`);
    } catch (err) {
        console.error(`파일 저장에 실패했습니다. (경로: "${saveFile}")`);
        console.error(err);
    }
}