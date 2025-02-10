import { UserDataType } from "./UserDataType";

export type FriendRequestsType = {
    "user" : UserDataType;
    "type" : "sent" | "received";
};
