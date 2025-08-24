import { dialog, ipcMain, ipcRenderer } from "electron";
import { getMainWindow } from "./windows";

ipcMain.handle('openFolderDialog', (l,{title}) => {
    
    if(!getMainWindow()) {
        return undefined;
    }

    return dialog.showOpenDialog(getMainWindow()!, {
        properties: ['openDirectory'],
        title
    })
})