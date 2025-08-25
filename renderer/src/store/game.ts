import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "./store";
import path from "path";
import { Config } from "modules/config";

const initialState: {
    gameDir?: string
    translationDir?: string
    selectedFile?: string
} = {

}

export const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setSelectedFile(state, {payload: selectedFile}: PayloadAction<string | undefined>) {
            state.selectedFile = selectedFile;

            Config.setLastTranslationFile(state.selectedFile)
            Config.saveConfig();
        },

        setGameDir(state, {payload: gameDir}: PayloadAction<string | undefined>) {
            if(!gameDir) {
                state.gameDir = undefined;
                state.translationDir = undefined;
                state.selectedFile = undefined;
                return;
            }

            state.gameDir = gameDir;
            state.translationDir = path.join(gameDir, "BepInEx", "Translation", "ko", "Text");
            state.selectedFile = undefined;
            
            Config.setLastTranslationFile(undefined);
            Config.setLastGameDir(state.gameDir);
            Config.saveConfig();
        }
    }
})

export const {setGameDir,setSelectedFile} = gameSlice.actions;
export const gameSelector = (state: State) => state.game;