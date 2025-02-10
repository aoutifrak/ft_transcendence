import { profileIcon } from "@/media-exporting";
import { chatUsersChatCard } from "../../styles";
import { Link } from "react-router-dom";
import { ConversationListDataType } from "./ConversationsList";
import { useRef } from "react";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { setConversationsData } from "@/src/pages/modules/setAuthenticationData";
import { AxiosResponse } from "axios";
import { axiosPrivate } from "@/src/services/api/axios";
import LoadingOrNoMoreData from "@/src/pages/components/LoadingOrNoMoreData";

const fetchingConversationsListData = (
  url: string,
  page?: number,
  username?: string
): Promise<AxiosResponse<any, any>> => {
  let requestParams = {};
  if (page) requestParams = { ...requestParams, page: page };
  if (username) requestParams = { ...requestParams, username: username };
  return axiosPrivate.get(url, { params: requestParams });
};

const UsersChatCard = ({conversations} : {conversations:ConversationListDataType[]}) => {
  const refConversationList = useRef<HTMLDivElement>(null);
  const conversationListStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } =
    useInfiniteScroll<ConversationListDataType>({
      url: "chat/conversations",
      refElement: refConversationList.current,
      startPositionRef: conversationListStartRef.current,
      data: conversations,
      setData: setConversationsData,
      offset: 200,
      scrollDirection: "bottom",
      fetchingData: fetchingConversationsListData,
    });
  const r = (Math.random() + 1).toString(36).substring(20);
  return (
    <>
      <div
        className="tab-pane"
        id="all-msgs-content"
        role="tabpanel"
        aria-labelledby="all-msgs"
        onScroll={handleScroll}
        ref={refConversationList}
      >
        <div ref={conversationListStartRef} />
        {conversations.map((conversationUser, index) => (
          <Link
            to={conversationUser.username + ""}
            className={`${chatUsersChatCard}`}
            key={index}
          >
            <div className="" id="userImage">
              <div className="">
                <svg className="">
                  <pattern
                    id={`pattImage${
                      r +
                      conversationUser.created_at +
                      conversationUser.username
                    }`}
                    x="0"
                    y="0"
                    height="100%"
                    width="100%"
                  >
                    <image
                      x="0.1em"
                      width="100%"
                      height="100%"
                      y="0.1em"
                      href={
                        conversationUser.avatar
                          ? process.env.VITE_BACKEND_API_URL +
                            conversationUser.avatar
                          : profileIcon
                      }
                    />
                  </pattern>
                  <circle
                    cx="1em"
                    cy="1em"
                    r="1em"
                    fill={`url(#pattImage${
                      r +
                      conversationUser.created_at +
                      conversationUser.username
                    })`}
                    stroke="lightblue"
                    strokeWidth="1"
                  />
                </svg>
                <svg className="">
                  {conversationUser.is_online && (
                    <circle
                      className="position-absolutee"
                      cx="6px"
                      cy="6px"
                      r="6px"
                      fill="#21FF5FED"
                    />
                  )}
                </svg>
              </div>
            </div>
            <div className="" id="userNameWriting">
              <p className="">
                {conversationUser.first_name
                  ? conversationUser.first_name
                  : "????????"}{" "}
                {conversationUser.last_name
                  ? conversationUser.last_name
                  : "???????"}
              </p>
              <small className={``}>{conversationUser.username}</small>
            </div>
          </Link>
        ))}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
    </>
  );
};
export default UsersChatCard;
