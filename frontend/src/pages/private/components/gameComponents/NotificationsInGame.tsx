import { Fragment, useEffect, useRef } from "react";
import { IoNotificationsSharp } from "react-icons/io5";
import { notificationsInGame } from "../../styles";
import { profileIcon } from "@/media-exporting";
import { Link } from "react-router-dom";
import { FaUserCheck } from "react-icons/fa";
import { FiUserX } from "react-icons/fi";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/src/pages/modules/fetchingData";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { axiosPrivate } from "@/src/services/api/axios";
import { NotificationsDataType } from "@/src/customDataTypes/NotificationsDataType";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { AxiosResponse } from "axios";
import { setNotificationsData } from "@/src/pages/modules/setAuthenticationData";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import LoadingOrNoMoreData from "@/src/pages/components/LoadingOrNoMoreData";

type NotificationsCardsProps = {
  message: string;
  sender_notif?: UserDataType;
};

const NotificationsFriendRequestCard = ({
  message,
  sender_notif,
}: NotificationsCardsProps) => {
  return (
    <div className="message-accept-reject-buttons">
      <div className="message">{message}</div>
      <div className="accept-reject-buttons">
        <button
          className="accept-button"
          onClick={() => {
            acceptFriendRequest(sender_notif?.username!);
          }}
        >
          <FaUserCheck />
        </button>
        <button
          className="reject-button"
          onClick={() => {
            rejectFriendRequest(sender_notif?.username!);
          }}
        >
          <FiUserX />
        </button>
      </div>
    </div>
  );
};

const NotificationsInviteCard = ({ message }: NotificationsCardsProps) => {
  return (
    <Fragment>
      <div className="message">{message}</div>
    </Fragment>
  );
};

let isbillRingFocused: boolean = false;
let isNotificationsDevFocused: boolean = false;

const hideNotificationsList = (
  notificationListRef: React.MutableRefObject<any>
) => {
  let classNameString: string | undefined =
    notificationListRef.current.className;
    if (isbillRingFocused === false && isNotificationsDevFocused === false){
      if (!notificationListRef.current.className?.includes("d-none")) {
        classNameString = classNameString?.concat(" d-none");
        notificationListRef.current.className = classNameString;
      }
    }
};
const showNotificationsList = (
  notificationListRef: React.MutableRefObject<any>
) => {
  let classNameString: string | undefined =
    notificationListRef.current.className;
  if (notificationListRef.current.className?.includes("d-none")) {
    classNameString = classNameString?.replace(" d-none", "");
    notificationListRef.current.className = classNameString;
  }
};
const fetchingNotifications = (
  url: string,
  page?: number,
  username?: string
): Promise<AxiosResponse<any,any>> => {
  let requestParams = {}
  if (page)
    requestParams = {...requestParams, page: page};
  if (username)
    requestParams = {...requestParams, username: username};
  return axiosPrivate.get(url,{params: requestParams});
};
const NotificationsInGame = () => {
  const notificationListRef = useRef(null);
  const notificationsList = useSelector((state: RootState) => state.notifications.value);
  const allUsersData = useSelector((state: RootState) => state.allUsers.value);
  const notificationsStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } = useInfiniteScroll<NotificationsDataType>({
    url: "notification/notif",
    refElement: notificationListRef.current,
    startPositionRef: notificationsStartRef.current,
    data: notificationsList,
    setData: setNotificationsData,
    offset: 50,
    scrollDirection: "bottom",
    fetchingData: fetchingNotifications,
  });
  useEffect(() => {
    return () => {
      isbillRingFocused = false;
      isNotificationsDevFocused = false;
    }
  }, [allUsersData]);
  
  return (
    <div className={notificationsInGame}>
      <div
        tabIndex={0}
        className="notifications-ring-number"
        onFocus={() => {
          isbillRingFocused = true;
          showNotificationsList(notificationListRef);
        }}
        onBlur={() => {
          isbillRingFocused = false;
          hideNotificationsList(notificationListRef);
        }}
      >
        <IoNotificationsSharp color="white" size={23} />
        <span className="number-of-notifications">
          {notificationsList && notificationsList.length
            ? notificationsList.length
            : ""}
        </span>
      </div>
      <div
        className="notifications-list d-none"
        tabIndex={0}
        onMouseEnter={() => (isNotificationsDevFocused = true)}
        onMouseLeave={() => (isNotificationsDevFocused = false)}
        onFocus={() => showNotificationsList(notificationListRef)}
        onBlur={() => {
          isNotificationsDevFocused = false;
          hideNotificationsList(notificationListRef);
        }}
        ref={notificationListRef}
        onScroll={handleScroll}
      >
        <div ref={notificationsStartRef} />
        {notificationsList && notificationsList.length ? (
          notificationsList.map((notification) => {
            return (
              <div
                className="notifications-card"
                key={notification.sender_notif.username}
              >
                <Link to={`/profile/${notification.sender_notif.username}`} className="image">
                  <img
                    src={
                      notification.sender_notif.avatar
                        ? process.env.VITE_BACKEND_API_URL +
                          notification.sender_notif.avatar
                        : profileIcon
                    }
                    alt="user image"
                  />
                </Link>
                {notification.type === "friend_request" ? (
                  <NotificationsFriendRequestCard
                    message={notification.message}
                    sender_notif={notification.sender_notif}
                  />
                ) : (
                  <NotificationsInviteCard
                    message={notification.message}
                    sender_notif={notification.sender_notif}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="notifications-card text-danger">
            no notifications to show
          </div>
        )}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
    </div>
  );
};

export default NotificationsInGame;
