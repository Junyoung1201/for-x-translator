import { config } from "dotenv";
import { app } from "electron";

config();

export const debugMode = !app.isPackaged && process.env.DEBUG === 'true'