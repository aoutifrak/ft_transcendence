import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { FriendsDataType } from "@/src/customDataTypes/FriendsDataType";



interface AuthenticatorState {
  value: FriendsDataType[];
}

const initialState: AuthenticatorState = { value: [] };

const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<FriendsDataType[]>) => {
        state.value = action.payload;
    }
  },
});

export const {setFriends} = friendsSlice.actions;
export default friendsSlice.reducer;