import { w3cwebsocket } from "websocket";
import { createContext } from "react";
import { UserDataType } from "./UserDataType";

type ChatDataContextType = {
    userData: UserDataType | undefined;
    setUserData: React.Dispatch<React.SetStateAction<UserDataType | undefined>>;
    chatSocket: w3cwebsocket | null;
  };
  
  export const ChatDataContext: React.Context<ChatDataContextType | undefined> =
    createContext<ChatDataContextType | undefined>(undefined);