import { createSlice } from "@reduxjs/toolkit";

interface AuthenticatorState {
    value: boolean,
}

const initialState: AuthenticatorState = {value:false};

const authenticatorSlice = createSlice({
    name: "authenticator",
    initialState,
    reducers: {
        reverseAuthenticated: (state) => {
            state.value = !state.value;
        },
        setAuthenticated: (state) => {
            state.value = true;
        },
        setUnauthenticated :( state) => {
            state.value = false;
        }
    }
});

export const {reverseAuthenticated, setAuthenticated, setUnauthenticated} = authenticatorSlice.actions;

export default authenticatorSlice.reducer;
