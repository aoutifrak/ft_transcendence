import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import authenticatorSlice from "@src/states/authentication/authenticatorSlice";
import accessTokenSlice from "./authentication/accessTokenSlice";
import userSlice from "./authentication/userSlice";
import friendsSlice from "./authentication/friendsSlice";
import allUsersSlice from "./authentication/allUsersSlice";
import messagesSlice from "./authentication/messagesSlice";
import notificationsSlice from "./authentication/notificationsSlice";
import conversationsSlice from "./authentication/conversationsSlice";
import friendRequestsSlice from "./authentication/friendRequestsSlice";

export const store = configureStore({
  reducer: {
    authenticator: authenticatorSlice,
    accessToken: accessTokenSlice,
    user: userSlice,
    allUsers: allUsersSlice,
    friends: friendsSlice,
    friendRequests: friendRequestsSlice,
    messages: messagesSlice,
    notifications: notificationsSlice,
    conversations: conversationsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;