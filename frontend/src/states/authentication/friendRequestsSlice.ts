import { FriendRequestsType } from "@/src/customDataTypes/FriendRequestsType";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";




interface AuthenticatorState {
  value: FriendRequestsType[];
}

const initialState: AuthenticatorState = { value: [] };

const friendRequestsSlice = createSlice({
  name: "friendRequests",
  initialState,
  reducers: {
    setFriendRequests: (state, action: PayloadAction<FriendRequestsType[]>) => {
        state.value = action.payload;
    }
  },
});

export const {setFriendRequests} = friendRequestsSlice.actions;
export default friendRequestsSlice.reducer;