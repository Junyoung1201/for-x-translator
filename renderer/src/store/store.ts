import {configureStore} from '@reduxjs/toolkit';
import { gameSlice } from './game';
import { messageSlice } from './message';

export const store = configureStore({
    reducer: {
        game: gameSlice.reducer,
        message: messageSlice.reducer
    }    
})

export type State = ReturnType<typeof store.getState>