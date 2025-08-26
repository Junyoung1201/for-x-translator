import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "./store";

const initialState: {
    output?: string
} = {

}

export const translateSlice = createSlice({
    name: 'translate',
    initialState,
    reducers: {
        setOutput(state, action: PayloadAction<string | undefined>) {
            state.output = action.payload;
        }
    }
})

export const translateSelector = (state: State) => state.translate;
export const {setOutput} = translateSlice.actions;