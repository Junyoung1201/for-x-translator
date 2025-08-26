import { getSelectionText } from "utils/text";
import { openLastTranslationFile } from "./file-editor";
import { store } from "store/store";
import { setOutput } from "store/translate";
import { ipcRenderer } from "electron";

export async function globalShortcutHandler(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    console.log(key)

    // 파일 새로고침
    if (key === 'f5' || (e.ctrlKey && key === 'r')) {
        e.stopPropagation();
        e.preventDefault();

        console.log("파일 새로고침")

        openLastTranslationFile();
    }

    // 선택한 텍스트 번역
    if (
        (key === 'q' && e.altKey) ||
        key === 'pageup'
     ) {
        e.stopPropagation();
        e.preventDefault();

        const translator = document.querySelector<HTMLSelectElement>(`select#translator-select`).value.toLowerCase();

        let srcText = getSelectionText();

        if (!srcText) {

            // 선택된 텍스트는 없는데, 현재 키 입력된 곳이 input 또는 textarea 요소
            //  = 해당 input, textarea 요소의 내용을 번역
            const target = e.target as HTMLInputElement;

            if(["input","textarea"].includes(target.tagName.toLowerCase())) {
                srcText = target.value;
            } else {
                console.log("텍스트가 선택되지 않음.");
                srcText = "";
            }

        }

        // 번역기 입력란에 자동 반영
        const tlInputElement = document.querySelector<HTMLTextAreaElement>(`textarea#tl-input`)

        if (tlInputElement) {
            tlInputElement.value = srcText;
        }

        // 번역 시작 
        const { success, data, message } = await ipcRenderer.invoke('translate', { translator, srcText });

        console.log(`텍스트 번역(${translator}) 중:`,srcText);

        // 번역 결과 출력
        if (success) {
            store.dispatch(setOutput(data));
        } else {
            store.dispatch(setOutput(message));
        }

    }
}