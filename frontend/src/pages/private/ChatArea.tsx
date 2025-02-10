import { profileIcon, visibilityProfileIcon } from "@/media-exporting";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { chat } from "./styles";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { SlEmotsmile } from "react-icons/sl";
import ConversationContent from "./components/chatComponents/ConversationContent";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { ChatDataContext } from "@/src/customDataTypes/ChatDataContext";
import { w3cwebsocket } from "websocket";
import { RootState, store } from "@/src/states/store";
import { setConversationsData, setMessagesData } from "../modules/setAuthenticationData";
import { useSelector } from "react-redux";
import { axiosPrivate } from "@/src/services/api/axios";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { FriendsDataType } from "@/src/customDataTypes/FriendsDataType";
import { toast } from "react-toastify";

const MessageSchema = z.object({
  textMessage: z
    .string()
    .max(1023, { message: "the message should not be more than 1023 chars" })
    .min(1, { message: "not allowed to send an empty string" }),
});

type MessageSchemaType = z.infer<typeof MessageSchema>;

const FormComponent = () => {
  const { register, handleSubmit, reset } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });
  const messages = useSelector((state: RootState) => state.messages.value);
  const friends = useSelector((state: RootState) => state.friends.value);
  const chatContext = useContext(ChatDataContext);
  if (!chatContext)
    throw new Error("this component need to be wrapped by chat context");
  const { userData, chatSocket } = chatContext;
  const onSubmit: SubmitHandler<MessageSchemaType> = async (
    data: MessageSchemaType
  ) => {
    try {
      if (data.textMessage.length > 0) {
        let dataToSend = {
          receiver: userData?.username,
          message: data.textMessage,
        };
        if (chatSocket?.readyState === w3cwebsocket.OPEN) {
          chatSocket?.send(JSON.stringify(dataToSend));
          if (
            friends.find(
              (friend: FriendsDataType) =>
                friend.username === dataToSend.receiver
            ) &&
            !userData?.is_blocked
          ) {
            if (userData && !store.getState().conversations.value.find((convers) => convers.username === userData.username)){
              setConversationsData([
                ...store.getState().conversations.value,
                userData,
              ]);
            }
            setMessagesData([
              ...messages,
              {
                message: data.textMessage,
                sender: store.getState().user.value,
                updated_at: new Date().toISOString(),
              },
            ]);
            reset({ textMessage: "" });
          }
        }
      }
    } catch (err) {}
  };

  return (
    <>
      <form className="sendMessageField" onSubmit={handleSubmit(onSubmit)}>
        <span className="invisible">
          <SlEmotsmile size={30} />
        </span>
        <input
          type="text"
          placeholder="Type..."
          {...register("textMessage", { required: true })}
          className=""
          autoComplete="on"
        />
        <button className="" type="submit">
          <IoArrowForwardCircleOutline size={30} />
        </button>
      </form>
    </>
  );
};

const ChatArea = () => {
  const { userName } = useParams();
  const [user, setUser] = useState<UserDataType | undefined>(undefined);
  const setProfileVisible =
    useOutletContext<React.Dispatch<React.SetStateAction<boolean>>>();
  const chatContext = useContext(ChatDataContext);
  if (!chatContext)
    throw new Error("this component need to be wrapped by chat context");
  const navigate = useNavigate();
  useEffect(() => {
    if (chatContext.userData?.username !== userName && userName !== undefined) {
      axiosPrivate
        .post("search_username", { username: userName })
        .then((res) => {
          if (res.data?.error === "User matching query does not exist.")
          {
            toast.error("Error : no user with the username provided",{containerId:"validation", toastId: res.data.error + "chat"})
            navigate("/chat", {replace: true});
          }
          chatContext.setUserData(res.data);
        })
        .catch((err) => {
          if (err.name === "CanceledError") return;
          setUser(undefined);
          chatContext.setUserData(undefined);
        });
    } else {
      if (user?.username !== userName) setUser(chatContext.userData);
    }
  }, [userName, chatContext?.userData]);
  useEffect(() => {
    return () => {
      setMessagesData([]);
    };
  }, [userName]);
  return (
    <>
      <div className={`${chat}`}>
        <div id="chatAreaHeader">
          <div className="d-flex flex-row">
            <div className="" id="userImageInChat">
              <div className="">
                <svg className="">
                  <pattern
                    id={`pattImage_12`}
                    x="0"
                    y="0"
                    height="100%"
                    width="100%"
                  >
                    <image
                      x="0"
                      y="0"
                      href={
                        user?.avatar
                          ? process.env.VITE_BACKEND_API_URL + user.avatar
                          : profileIcon
                      }
                    />
                  </pattern>
                  <circle
                    cx="1.5em"
                    cy="1.5em"
                    r="1.5em"
                    fill={`url(#pattImage_12)`}
                    stroke="lightblue"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
            <div className="" id="userNameStatus">
              <p className="">{user?.username}</p>
              {user?.is_online ? (
                <small className={``}>online</small>
              ) : (
                <small className={`text-danger`}>offline</small>
              )}
            </div>
          </div>
          <div
            className="d-flex align-items-center ms-auto py-2 "
            onClick={() => setProfileVisible((prev) => !prev)}
          >
            <svg
              width="1.5em"
              height="1.5em"
              className="profileVisibility bg-secondary bg-opacity-50"
            >
              <image
                x="0"
                y="0"
                width="100%"
                height="100%"
                href={visibilityProfileIcon}
              />
            </svg>
          </div>
        </div>
        <div className="chatContent">
          <div className="messagesArea">
            <ConversationContent />
          </div>
          <FormComponent />
        </div>
      </div>
    </>
  );
};

export default ChatArea;
