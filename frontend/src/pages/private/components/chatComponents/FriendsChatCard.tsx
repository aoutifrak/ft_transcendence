import { profileIcon } from "@/media-exporting";
import { chatUsersChatCard } from "../../styles";
import { Link } from "react-router-dom";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";
import { FriendsDataType } from "@/src/customDataTypes/FriendsDataType";
import { useRef } from "react";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { setFriendsData } from "@/src/pages/modules/setAuthenticationData";
import { AxiosResponse } from "axios";
import { axiosPrivate } from "@/src/services/api/axios";
import LoadingOrNoMoreData from "@/src/pages/components/LoadingOrNoMoreData";

const fetchingFriendsData = (
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

const FriendsChatCard = () => {
  const friends: FriendsDataType[] = useSelector(
    (state: RootState) => state.friends.value
  );
  const refFriendsList = useRef<HTMLDivElement>(null);
  const friendsListStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } =
    useInfiniteScroll<FriendsDataType>({
      url: "friends",
      refElement: refFriendsList.current,
      startPositionRef: friendsListStartRef.current,
      data: friends,
      setData: setFriendsData,
      offset: 200,
      scrollDirection: "bottom",
      fetchingData: fetchingFriendsData,
    });
  const r = (Math.random() + 1).toString(36).substring(20);
  return (
    <>
      <div
        className="tab-pane active"
        id="unread-msgs-content"
        role="tabpanel"
        aria-labelledby="unread-msgs"
        onScroll={handleScroll}
        ref={refFriendsList}
      >
        <div ref={friendsListStartRef} />
        {friends && friends.length ? (
          friends.map((friend, index) => (
            <Link
              to={friend.username + ""}
              className={`${chatUsersChatCard}`}
              key={index + " friends"}
            >
              <div className="" id="userImage">
                <div className="">
                  <svg className="">
                    <pattern
                      id={`pattImage${r + friend.username}friends`}
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
                          friend.avatar
                            ? process.env.VITE_BACKEND_API_URL + friend.avatar
                            : profileIcon
                        }
                      />
                    </pattern>
                    <circle
                      cx="1em"
                      cy="1em"
                      r="1em"
                      fill={`url(#pattImage${r + friend.username}friends)`}
                      stroke="lightblue"
                      strokeWidth="1"
                    />
                  </svg>
                  <svg className="">
                    {friend.is_online && (
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
                  {friend.first_name ? friend.first_name : "????????"}{" "}
                  {friend.last_name ? friend.last_name : "???????"}
                </p>
                <small className={``}>{friend.username}</small>
              </div>
            </Link>
          ))
        ) : (
          <div>you have no Friends!</div>
        )}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
    </>
  );
};
export default FriendsChatCard;
