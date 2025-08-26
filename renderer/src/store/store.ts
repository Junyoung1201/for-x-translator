import {configureStore} from '@reduxjs/toolkit';
import { gameSlice } from './game';
import { messageSlice } from './message';
import { translateSlice } from './translate';

export const store = configureStore({
    reducer: {
        game: gameSlice.reducer,
        message: messageSlice.reducer,
        translate: translateSlice.reducer
    }    
})

export type State = ReturnType<typeof store.getState>