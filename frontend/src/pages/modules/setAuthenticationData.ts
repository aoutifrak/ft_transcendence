import Cookies from "js-cookie";
import {
  setAuthenticated,
  setUnauthenticated,
} from "@/src/states/authentication/authenticatorSlice";
import { setAccessToken } from "@/src/states/authentication/accessTokenSlice";
import { setUser } from "@/src/states/authentication/userSlice";
import { store } from "@/src/states/store";
import { setFriends } from "@/src/states/authentication/friendsSlice";
import {
  AllUsersDataType,
  setAllUsers,
} from "@/src/states/authentication/allUsersSlice";
import {
  setMessages,
} from "@/src/states/authentication/messagesSlice";
import { MessagesDataType } from "@/src/customDataTypes/MessagesDataType";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { setFriendRequests } from "@/src/states/authentication/friendRequestsSlice";
import { FriendRequestsType } from "@/src/customDataTypes/FriendRequestsType";
import { NotificationsDataType } from "@/src/customDataTypes/NotificationsDataType";
import { setNotifications } from "@/src/states/authentication/notificationsSlice";
import { setConversations } from "@/src/states/authentication/conversationsSlice";

const setCookies = (cookiesAccessToken: string): void => {
  if (cookiesAccessToken !== Cookies.get("accessToken"))
    Cookies.set("accessToken", cookiesAccessToken);
};
const dispatch = store.dispatch;
const state = store.getState();

export default function setAuthenticatedData(
  RespondedAccessToken: string | undefined
): boolean {
  if (!RespondedAccessToken) {
    setUnAuthenticatedData();
  } else {
    setCookies(RespondedAccessToken);
    if (RespondedAccessToken !== state.accessToken.value)
      dispatch(setAccessToken(RespondedAccessToken));
    if (state.authenticator.value !== true) dispatch(setAuthenticated());
    return true;
  }
  return false;
}

export function setUnAuthenticatedData() {
  Cookies.remove("accessToken");
  if (state.accessToken.value) dispatch(setAccessToken(undefined));
  dispatch(setUnauthenticated());
}

export function setUserData(userData: UserDataType) {
  dispatch(setUser(userData));
}
export function setAllUsersData(allUsersData: AllUsersDataType[]) {
  dispatch(
    setAllUsers(
      allUsersData.filter((user) => user.username !== state.user.value.username)
    )
  );
}

export function setFriendsData(friendsData: UserDataType[]) {
  dispatch(setFriends(friendsData));
}
export function setFriendRequestsData(friendRequestsData: FriendRequestsType[]) {
  dispatch(setFriendRequests(friendRequestsData));
}
export function setNotificationsData(notificationsData: NotificationsDataType[]) {
  dispatch(setNotifications(notificationsData));
}
export function setConversationsData(conversationsData: UserDataType[]) {
  dispatch(setConversations(conversationsData));
}

export function setMessagesData(messages: MessagesDataType[]) {
  dispatch(setMessages(messages));
}
