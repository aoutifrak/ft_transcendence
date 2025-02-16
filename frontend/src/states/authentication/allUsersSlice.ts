import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AllUsersDataType {
  avatar: string;
  first_name: string;
  last_name: string;
  username: string;
  is_friend_req: "sent" | "received" | false;
  is_online: boolean;
  is_blocked: boolean;
  is_friend: boolean;
}

interface AuthenticatorState {
  value: AllUsersDataType[];
}

const initialState: AuthenticatorState = { value: [] };

const allUsersSlice = createSlice({
  name: "allUsers",
  initialState,
  reducers: {
    setAllUsers: (state, action: PayloadAction<AllUsersDataType[]>) => {
      state.value = action.payload;
    },
  },
});

export const { setAllUsers } = allUsersSlice.actions;

export default allUsersSlice.reducer;
