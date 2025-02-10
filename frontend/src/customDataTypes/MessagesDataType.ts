import { UserDataType } from "./UserDataType";

export interface MessagesDataType {
    sender: UserDataType;
    message: string;
    updated_at: string;
  }