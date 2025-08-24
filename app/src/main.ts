import { app, globalShortcut } from "electron";
import { closeBrowser, setupBrowser } from "./translate";
import {play as _playSound} from 'sound-play';
import { openMainWindow } from "./windows";
import './ipc';
import './constants'

export let playSound = _playSound;

app.whenReady().then(async () => {
    console.log(`\n\tForTranslator\n\n`);

    await setupBrowser();

    openMainWindow();
})

app.on('will-quit', exit);

process.on('SIGINT', exit)

async function exit() {
    globalShortcut.unregisterAll();

    await closeBrowser();

    app.exit(0);
}