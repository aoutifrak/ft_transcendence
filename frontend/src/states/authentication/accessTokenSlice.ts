import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthenticatorState {
    value: string | undefined,
}

const initialState: AuthenticatorState = {value: undefined};

const accessTokenSlice = createSlice({
    name: "accessToken",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string | undefined>) => {
            state.value = action.payload;
        }
    }
});

export const {setAccessToken} = accessTokenSlice.actions;

export default accessTokenSlice.reducer;
