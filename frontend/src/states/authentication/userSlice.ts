import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";



interface AuthenticatorState {
  value: UserDataType ;
}

const initialState: AuthenticatorState = { value: {
  email: "",
  username: "",
  created_at: "",
  is2fa: false,
  is_online: false,
  is_blocked: false
} };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDataType>) => {
      state.value = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
