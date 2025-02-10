import { Outlet } from "react-router-dom";
import { chatLayout } from "../styles";
import { useLayoutEffect, useState } from "react";
import ConversationsList from "@/src/pages/private/components/chatComponents/ConversationsList";
import "@router/styles/chatGlobalOverridingStyles.css";
import Profile from "./components/chat/Profile";
import { ChatDataContext } from "@/src/customDataTypes/ChatDataContext";
import { RootState } from "@/src/states/store";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { useSelector } from "react-redux";
import { useHandleSockets } from "@/src/services/hooks/useHandleSockets";
import { closeSocket } from "@/src/pages/modules/closeSocket";
import { w3cwebsocket } from "websocket";

let chatSocketHelper: w3cwebsocket | null = null;
const ChatLayout = () => {
  const [isProfileVisible, setProfileVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);
  const accessToken = useSelector(
    (state: RootState) => state.accessToken.value
  );

  const { client: chatSocket, setClient: setChatSocket } = useHandleSockets({urlOfSocket:"chat", accessToken: accessToken})
  chatSocketHelper = chatSocket;
  useLayoutEffect(() => {
    return () => {
      closeSocket(chatSocketHelper);
      chatSocketHelper = null;
    }
  },[])
  return (
    <ChatDataContext.Provider
      value={{ userData, setUserData, chatSocket, setChatSocket}}
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
