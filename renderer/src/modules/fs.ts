import { dialog, ipcRenderer } from "electron";
import fs from 'fs/promises';
import path from "path";

export async function pathExists(fileOrDir: string) {
    try {
        await fs.access(fileOrDir);
        return true;
    } catch {
        return false;
    }
}

export async function openGameFolderDialog() {
    const {filePaths} = (await ipcRenderer.invoke("openFolderDialog", {title: "게임 폴더 선택"}) ?? {filePaths: []});
    const [dir] = filePaths;

    if (!dir || dir.length === 0) {
        return;
    }

    if (await pathExists(dir)) {
        const fileList = await fs.readdir(dir, { withFileTypes: true });

        const invalidFlag = (
            // UnityPlayer.dll 없음
            !fileList.some(file => file.name === 'UnityPlayer.dll') ||

            // .exe 없음
            !fileList.some(file => path.extname(file.name) === '.exe')
        )

        if (invalidFlag) {
            // 작업 취소 (올바른 게임 폴더가 아님)
            return { success: false, message: "게임 폴더가 올바르지 않았습니다." }
        } else {
            // 사용자가 선택한 게임 폴더 반환
            return { success: true, data: dir };
        }

    } else {
        return { success: false, message: "게임 폴더를 찾을 수 없습니다." }
    }
}