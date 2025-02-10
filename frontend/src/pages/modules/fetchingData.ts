import { store } from "@/src/states/store";
import {
  setAllUsersData,
  setFriendRequestsData,
  setFriendsData,
  setNotificationsData,
} from "./setAuthenticationData";
import axios, { axiosPrivate } from "@/src/services/api/axios";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { AllUsersDataType } from "@/src/states/authentication/allUsersSlice";
import { FriendRequestsType } from "@/src/customDataTypes/FriendRequestsType";
import { NotificationsDataType } from "@/src/customDataTypes/NotificationsDataType";
import { w3cwebsocket } from "websocket";
import { closeSocket } from "./closeSocket";
import refreshToken from "@/src/services/hooks/refreshToken";
import { FriendsDataType } from "@/src/customDataTypes/FriendsDataType";

export const sendFriendRequest = (username: string) => {
  axiosPrivate
    .post("friend_req/", { username: username })
    .then(() => {
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_friend: false, is_friend_req: "sent" }
            : user;
        })
      );
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    });
};

export const removeFriend = (username: string) => {
  axiosPrivate
    .delete("friends", { data: { username: username } })
    .then(() => {
      setFriendsData(
        store
          .getState()
          .friends.value.filter(
            (friend: UserDataType) => friend.username !== username
          )
      );
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_friend: false, is_friend_req: false }
            : user;
        })
      );
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    });
};

export const rejectFriendRequest = async (username: string) => {
  axiosPrivate
    .delete("friend_req/", { data: { username: username } })
    .then(() => {
      setFriendRequestsData([
        ...store
          .getState()
          .friendRequests.value.filter(
            (friend_req: FriendRequestsType) =>
              friend_req.user.username !== username
          ),
      ]);
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_friend_req: false }
            : user;
        })
      );
      setNotificationsData(
        store
          .getState()
          .notifications.value.filter(
            (notif: NotificationsDataType) =>
              notif.sender_notif.username !== username
          )
      );
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    })
    .finally(() => {
      return;
    });
};

export const acceptFriendRequest = async (
  username: string,
  userToBeFriend?: UserDataType
) => {
  axiosPrivate
    .put("friend_req/", { username: username })
    .then(() => {
      if (userToBeFriend && store.getState().friends.value) {
        setFriendsData([...store.getState().friends.value, userToBeFriend]);
      }
      if (store.getState().friendRequests.value)
        setFriendRequestsData([
          ...store
            .getState()
            .friendRequests.value.filter(
              (friend_req: FriendRequestsType) =>
                friend_req.user.username !== username
            ),
        ]);
      if (store.getState().friendRequests.value && !userToBeFriend) {
        let temp_data;
        temp_data = store
          .getState()
          .friendRequests.value.find(
            (friendReq) => friendReq.user.username === username
          );
        temp_data &&
          setFriendsData([...store.getState().friends.value, temp_data.user]);
      }
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_friend: true, is_friend_req: false }
            : user;
        })
      );
      setNotificationsData(
        store
          .getState()
          .notifications.value.filter(
            (notif: NotificationsDataType) =>
              notif.sender_notif.username !== username
          )
      );
    })
    .catch((err) => {if (err.name === "CanceledError") return;})
    .finally(() => {
      return;
    });
};

export const getAllUsersData = async () => {
  axiosPrivate
    .post("search_user")
    .then(async (response) => {
      setAllUsersData(response.data.results);
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
      setAllUsersData([]);
    });
};

export const blockUser = (username: string) => {
  axiosPrivate
    .post("block_user", { username: username })
    .then(() => {
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_blocked: true }
            : user;
        })
      );
      setFriendsData(
        store.getState().friends.value.map((user: FriendsDataType) => {
          return user.username === username
            ? { ...user, is_blocked: true }
            : user;
        })
      );
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    });
};

export const unblockUser = (username: string) => {
  axiosPrivate
    .delete("block_user", { data: { username: username } })
    .then(() => {
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          return user.username === username
            ? { ...user, is_blocked: false }
            : user;
        })
      );
      setFriendsData(
        store.getState().friends.value.map((user: FriendsDataType) => {
          return user.username === username
            ? { ...user, is_blocked: false }
            : user;
        })
      );
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    });
};

export const isValidAccessToken = (clientSocket?: w3cwebsocket | null) => {
  axios.post("Verify_token", {token: store.getState().accessToken.value})
  .then()
  .catch(async () => {
    if (clientSocket?.readyState === w3cwebsocket.OPEN) closeSocket(clientSocket);
    const refresh = refreshToken();
    let tmpAccessTokenFrom = await refresh();
    if (!tmpAccessTokenFrom) return false;
  })
  return true;
};