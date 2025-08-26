import { readFile } from "fs/promises";
import path from "path";

let DEBUG = false;

export async function initDebugMode() {
    try {
        let json = await readFile(path.join(__dirname, "..", "config.json"), "utf-8");
        DEBUG = JSON.parse(json)["debug"] ?? false;

        if(DEBUG) {
            console.log("디버그");
        }
    } catch {
        DEBUG = false;
    }
}

export function isDebug() {
    return DEBUG;
}