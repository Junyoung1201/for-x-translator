import fs from 'fs/promises';
import { I_StringLine } from "types/file-editor";
import { Config } from './config';
import { store } from 'store/store';
import { setGameDir, setSelectedFile } from 'store/game';

export function openLastTranslationFile() {
    const { lastGameDir, lastTranslationFile } = Config.getConfig();

    if (lastGameDir) {

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