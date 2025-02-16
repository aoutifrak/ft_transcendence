import { store } from "@/src/states/store";
import {
  setAllUsersData,
  setConversationsData,
  setFriendsData,
  setNotificationsData,
} from "./setAuthenticationData";
import { SocketJsonValueType } from "./watchSocket";
import { AllUsersDataType } from "@/src/states/authentication/allUsersSlice";
import { acceptFriendRequest, rejectFriendRequest } from "./fetchingData";
import { toast } from "react-toastify";
import NotificationsComponent from "@/src/router/layouts/components/notifications/NotificationsComponent";
import { NotificationsDataType } from "@/src/customDataTypes/NotificationsDataType";
import { ConversationListDataType } from "../private/components/chatComponents/ConversationsList";
import { CanceledError } from "axios";

function launchToast(
  data: SocketJsonValueType,
  accept?: () => void,
  reject?: () => void,
) {
  toast(
    <NotificationsComponent
      message={data.message}
      reject={reject}
      accept={accept}
      gameId={data.game_id}
      notificationType={data.type}
      toastName={data.sender.username + data.type}
    />,
    {
      autoClose: 8000,
      toastId: data.sender.username + data.type,
      containerId: "requests",
    }
  );
}

export const trigerRightEvent = (json_data: SocketJsonValueType) => {
  if (!json_data) return;
  switch (json_data.type) {
    case "unfriend": {
      setFriendsData(
        store
          .getState()
          .friends.value.filter(
            (user) => user.username !== json_data.sender.username
          )
      );
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          if (user.username === json_data.sender.username) {
            user = { ...user, is_friend: false, is_friend_req: false };
          }
          return user;
        })
      );
      break;
    }
    case "friend_request": {
      if (!store.getState().allUsers.value.find((user) => user.username ===json_data.sender.username))
        setAllUsersData([...store.getState().allUsers.value, json_data.sender]);
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          if (user.username === json_data.sender.username) {
            user = { ...user, is_friend: false, is_friend_req: "received" };
          }
          return user;
        })
      );
      setNotificationsData([
        ...store.getState().notifications.value,
        {
          message: `${json_data.sender.username} sent you a friend request`,
          sender_notif: json_data.sender,
          type: "friend_request",
        },
      ]);
      launchToast(
        json_data,
        async () => {
          try {
            await acceptFriendRequest(
              json_data.sender.username,
              json_data.sender
            );
          } catch (err) {
          } finally {
            toast.dismiss(json_data.sender.username + json_data.type);
          }
        },
        async () => {
          try {
            await rejectFriendRequest(json_data.sender.username);
          } catch (err) {
            if (err instanceof CanceledError) return;
          } finally {
            toast.dismiss(json_data.sender.username + json_data.type);
          }
        }
      );
      break;
    }
    case "accept_request": {
      setFriendsData([...store.getState().friends.value, json_data.sender]);
      if (!store.getState().allUsers.value.find((user) => user.username ===json_data.sender.username))
        setAllUsersData([...store.getState().allUsers.value, json_data.sender]);
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          if (user.username === json_data.sender.username) {
            user = { ...user, is_friend: true, is_friend_req: false };
          }
          return user;
        })
      );
      setNotificationsData(
        store
          .getState()
          .notifications.value.filter(
            (notification: NotificationsDataType) =>
              notification.sender_notif.username !== json_data.sender.username
          )
      );
      break;
    }
    case "reject_request": {
      setAllUsersData(
        store.getState().allUsers.value.map((user: AllUsersDataType) => {
          if (user.username === json_data.sender.username) {
            user = { ...user, is_friend: false, is_friend_req: false };
          }
          return user;
        })
      );
      setNotificationsData(
        store
          .getState()
          .notifications.value.filter(
            (notification: NotificationsDataType) =>
              notification.sender_notif.username !== json_data.sender.username
          )
      );
      break;
    }
    case "block_request": {
      break;
    }
    case "sent_message": {
      if (
        !store
          .getState()
          .conversations.value.find(
            (convers: ConversationListDataType) =>
              convers.username === json_data.sender.username
          )
      )
        setConversationsData([
          ...store.getState().conversations.value,
          json_data.sender,
        ]);
      break;
    }
    case "unblock_request": {
      break;
    }
    case "game_invite": {
      launchToast(json_data);
      break;
    }
    case "accept_invite": {
      launchToast(json_data, () => {}, () => {});
      break;
    }
    case "invite_tournemet": {
      toast.warn(json_data.message, {
        autoClose: 1000,
        toastId: json_data.sender?.username,
        containerId:"validation"
      });
      break;
    }
    default: {
      break;
    }
  }
};
