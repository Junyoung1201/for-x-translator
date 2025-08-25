import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "./store";

const initialState: {
    system?: string
} = {
    system: "이건 시스템 메세지"
}
export const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setSystemMessage(state, {payload:message}: PayloadAction<string | undefined>) {
            state.system = message;
        }
    }
})

export const messageSelector = (state: State) => state.message;
export const {setSystemMessage} = messageSlice.actions;