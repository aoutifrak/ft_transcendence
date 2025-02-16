import { Outlet } from "react-router-dom";
import { chatLayout } from "../styles";
import { useEffect, useState } from "react";
import ConversationsList from "@/src/pages/private/components/chatComponents/ConversationsList";
import "@router/styles/chatGlobalOverridingStyles.css";
import Profile from "./components/chat/Profile";
import { w3cwebsocket } from "websocket";
import { ChatDataContext } from "@/src/customDataTypes/ChatDataContext";
import { openSocket } from "@/src/pages/modules/openSocket";
import { RootState } from "@/src/states/store";
import { closeSocket } from "@/src/pages/modules/closeSocket";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { useSelector } from "react-redux";
import { isValidAccessToken } from "@/src/pages/modules/fetchingData";

let chatSocket_: w3cwebsocket | null = null;

const ChatLayout = () => {
  const [isProfileVisible, setProfileVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);
  const accessToken = useSelector(
    (state: RootState) => state.accessToken.value
  );

  useEffect(() => {
    if (!chatSocket_ || chatSocket_.readyState !== w3cwebsocket.OPEN) {
      if (isValidAccessToken(chatSocket_))
      {
        chatSocket_ = openSocket("chat", accessToken);
        if (chatSocket_) {
          chatSocket_.onclose = () => {
            if (chatSocket_) {
              if (chatSocket_.readyState === w3cwebsocket.CLOSED || chatSocket_.readyState === w3cwebsocket.CLOSING)
                chatSocket_ = null;
            }
          };
        }
      }
    }
    return () => {
      if (chatSocket_?.readyState === w3cwebsocket.OPEN)
      {
        closeSocket(chatSocket_)
      }
    };
  }, [accessToken]);

  return (
    <ChatDataContext.Provider
      value={{ userData, setUserData, chatSocket: chatSocket_ }}
    >
      <div className={`${chatLayout}`}>
        <main className="bg-infos" id="main">
          <section className="section1" id="section1">
            <ConversationsList />
          </section>
          <section className="" id="sectionOfChat">
            <Outlet context={setProfileVisible} />
          </section>
          <section
            className={`${!isProfileVisible && "d-none"} `}
            id="section2"
          >
            <Profile isProfileVisible={isProfileVisible} />
          </section>
        </main>
      </div>
    </ChatDataContext.Provider>
  );
};

export default ChatLayout;
