import { app, BrowserWindow } from "electron";
import path from "path";
import { debugMode } from "./constants";

let mainWindow: Electron.BrowserWindow | null = null;

export function getMainWindow() {
    return mainWindow;
}

export function openMainWindow() {

    if (!mainWindow) {
        let win = new BrowserWindow({
            title: "For-X-Translator",
            width: 1030,
            height: 630,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })

        win.setMenuBarVisibility(false);

        win.on('close', () => {
            mainWindow = null;
        });

        win.webContents.on('dom-ready', () => {
            win.webContents.executeJavaScript(`
                const __APP_PATH = "${app.getAppPath()}"
            `)
        })

        mainWindow = win;
    }

    if (app.isPackaged) {
        mainWindow.loadFile(path.join(app.getAppPath(), "index.html"))
    } else {
        mainWindow.loadURL("http://localhost:3001");
    }

    if (debugMode) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

}