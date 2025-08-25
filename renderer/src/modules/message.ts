import { setSystemMessage } from "store/message";
import { store } from "store/store";

export class Message {
    static system(message: string) {
        store.dispatch(setSystemMessage(message));
    }
}