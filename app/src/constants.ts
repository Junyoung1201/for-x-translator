import { config } from "dotenv";
import { app } from "electron";

config();

export const debugMode = !app.isPackaged && process.env.DEBUG === 'true'
export let TRANSLATOR_READY_TO_EXIT = false;