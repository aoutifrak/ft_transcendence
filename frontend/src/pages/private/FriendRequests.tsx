import { profileIcon } from "@/media-exporting";
import { friendRequests } from "./styles";
import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../modules/fetchingData";
import { FriendRequestsType } from "@/src/customDataTypes/FriendRequestsType";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { axiosPrivate } from "@/src/services/api/axios";
import { AxiosResponse } from "axios";
import LoadingOrNoMoreData from "../components/LoadingOrNoMoreData";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";
import { setFriendRequestsData } from "../modules/setAuthenticationData";

const fetchingFriendRequestsData = (
  url: string,
  page?: number,
  username?: string
): Promise<AxiosResponse<any, any>> => {
  let requestParams = {};
  if (page) requestParams = { ...requestParams, page: page };
  if (username) requestParams = { ...requestParams, username: username };
  return axiosPrivate.get(url, { params: requestParams });
};

const FriendRequests = () => {
  const friendRequestsList = useSelector((state: RootState) => state.friendRequests.value)
  const refFriendRequests = useRef<HTMLDivElement>(null);
  const friendRequestsStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } =
    useInfiniteScroll<FriendRequestsType>({
      url: "friend_req/",
      refElement: refFriendRequests.current,
      startPositionRef: friendRequestsStartRef.current,
      data: friendRequestsList,
      setData: setFriendRequestsData,
      offset: 100,
      scrollDirection: "bottom",
      fetchingData: fetchingFriendRequestsData,
    });

  if (!friendRequestsList || !friendRequestsList.length) {
    return (
      <div className={`${friendRequests}`}>
        <p className="no-friend-requests">
          You have no friend requests sent or received yet !!!!
          <br />
          go to{" "}
          <Link to="/game" className="">
            dashboard
          </Link>{" "}
          to send a friend request
        </p>
      </div>
    );
  }
  return (
    <div className={`${friendRequests}`}>
      <div className="" onScroll={handleScroll} ref={refFriendRequests}>
        <div ref={friendRequestsStartRef} />
        {friendRequestsList &&
          friendRequestsList.length &&
          friendRequestsList.map(({user, type}, index) => (
            <div className="friendrequests-card" key={index}>
              <Link
                to={`/profile/` + user.username}
                className="user-image-name-fullname"
              >
                <div className="user-image">
                  <div className="">
                    <img
                      src={
                        user.avatar
                          ? process.env.VITE_BACKEND_API_URL + "" + user.avatar
                          : profileIcon
                      }
                      alt=""
                      className="rounded-5 bg-info"
                    />
                  </div>
                </div>
                <div className="user-name-fullname">
                  <div className="user-fullname">
                    {user?.first_name?.length
                      ? user.first_name
                      : "?????????"}{" "}
                    {user?.last_name?.length
                      ? user.last_name
                      : "?????????"}
                  </div>
                  <div className="user-name">{user.username}</div>
                </div>
              </Link>
              <div className="accept-reject-cancel-button">
                {type === "received" ? (
                  <>
                    <div
                      className="accept-button"
                      title="accept friend request"
                      onClick={() => {
                        acceptFriendRequest(user.username + "");
                      }}
                    >
                      accept
                    </div>
                    <div
                      className="reject-button"
                      title="reject friend request"
                      onClick={() => {
                        rejectFriendRequest(user.username + "");
                      }}
                    >
                      reject
                    </div>
                  </>
                ) : (
                  <div
                    className="cancel-button"
                    title="cancel friend request"
                    onClick={() => {
                      rejectFriendRequest(user.username + "");
                    }}
                  >
                    cancel
                  </div>
                )}
              </div>
              <div
                className={`friend-request-type-${
                  type === "received" ? "received" : "sent"
                }`}
              >
                {type === "received" ? "received" : "sent     "}
              </div>
            </div>
          ))}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
    </div>
  );
};

export default FriendRequests;
