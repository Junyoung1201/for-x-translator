import { app, globalShortcut } from "electron";
import {play as _playSound} from 'sound-play';
import { openMainWindow } from "./windows";
import './ipc';
import './constants'
import { waitForCondition } from "./utils/utils";
import { isBrowserClosed } from "./translate";
import { initDebugMode } from "./debug";

export let playSound = _playSound;

app.whenReady().then(async () => {
    
    console.log(`\n\tForTranslator\n\n`);

    await initDebugMode();
    
    openMainWindow();
})

app.on('will-quit', exit);

process.on('SIGINT', exit)

async function exit() {
    globalShortcut.unregisterAll();

    await waitForCondition(isBrowserClosed);

    app.exit(0);
}