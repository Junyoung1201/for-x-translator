import { dialog, ipcMain, ipcRenderer } from "electron";
import { getMainWindow } from "./windows";
import { I_TranslateOptions } from "./types/translate";
import { ensureBrowser, translate_DeepL, translate_Google } from "./translate";

export function sendTranslationLog(message: string) {
    sendToRenderer('translation-log', message);
}

export function sendToRenderer(name: string, data: any) {
    getMainWindow()?.webContents?.send(name, data)
}

ipcMain.handle('openFolderDialog', (l,{title}) => {
    
    if(!getMainWindow()) {
        return undefined;
    }

    return dialog.showOpenDialog(getMainWindow()!, {
        properties: ['openDirectory'],
        title
    })
})

ipcMain.handle('translate', async (_,{
    srcText, srcLang, destLang, translator
}: I_TranslateOptions) => {

    await ensureBrowser();
    
    srcLang = srcLang ?? "ja";
    destLang = destLang ?? "ko";
    translator = translator ?? "deepl"

    if(!srcText) {
        return { success: false, message: "번역할 텍스트가 입력되지 않았습니다." }
    }

    if(!['deepl','google','papago'].includes(translator.toLowerCase())) {
        return { success: false, message: `"${translator}"(은)는 올바르지 않은 번역기 이름입니다.` }
    }

    srcLang = srcLang.toLowerCase();
    destLang = destLang.toLowerCase();

    let result = "";

    switch(translator) {
        case "deepl":
            result = await translate_DeepL(srcText, { srcLang, destLang });
            break;

        case "google":
            result = await translate_Google(srcText, { srcLang, destLang });
            break;
    }

    return { success: true, data: result };
})