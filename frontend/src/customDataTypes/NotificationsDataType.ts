import { UserDataType } from "./UserDataType";

export type NotificationsDataType = {
    message: string;
    sender_notif: UserDataType;
    type: string;
  };