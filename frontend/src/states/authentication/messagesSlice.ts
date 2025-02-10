import { MessagesDataType } from "@/src/customDataTypes/MessagesDataType";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthenticationState{
    value: MessagesDataType[]
}

const initialState: AuthenticationState = {value: []}

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<MessagesDataType[]>) => {
            state.value = action.payload;
        }
    }
})

export const {setMessages} = messagesSlice.actions;

export default messagesSlice.reducer;