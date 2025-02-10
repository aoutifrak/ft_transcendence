import { profileIcon } from "@/media-exporting";
import { friends } from "./styles";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { MdOutlineBlock, MdPersonRemoveAlt1 } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { blockUser, removeFriend, unblockUser } from "../modules/fetchingData";
import LoadingOrNoMoreData from "../components/LoadingOrNoMoreData";
import { setFriendsData } from "@/src/pages/modules/setAuthenticationData";
import { FriendsDataType } from "@/src/customDataTypes/FriendsDataType";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { AxiosResponse } from "axios";
import { axiosPrivate } from "@/src/services/api/axios";
import { inviteToGame } from "../modules/inviteTogame";

const fetchingFriendsData = (
  url: string,
  page?: number,
  username?: string
): Promise<AxiosResponse<any, any>> => {
  let requestParams = {};
  if (page) requestParams = { ...requestParams, page: page };
  if (username) requestParams = { ...requestParams, username: username };
  return axiosPrivate.get(url, { params: requestParams });
};

const Friends = () => {
  const friendsData = useSelector((state: RootState) => state.friends.value);
  const refFriends = useRef<HTMLDivElement>(null);
  const friendsStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } =
    useInfiniteScroll<FriendsDataType>({
      url: "friends",
      refElement: refFriends.current,
      startPositionRef: friendsStartRef.current,
      data: friendsData,
      setData: setFriendsData,
      offset: 100,
      scrollDirection: "bottom",
      fetchingData: fetchingFriendsData,
    });

  if (!friendsData || !friendsData.length) {
    return (
      <div className={`${friends}`}>
        <p className="no-friends">
          You have no friends yet !!!!
          <br />
          go to{" "}
          <Link to="/game" className="">
            dashboard
          </Link>{" "}
          to search for them
        </p>
      </div>
    );
  }
  return (
    <div className={`${friends}`}>
      <div className="" ref={refFriends} onScroll={handleScroll}>
        <div ref={friendsStartRef} />
        {friendsData &&
          friendsData.length &&
          friendsData.map((friend) => (
            <div className="friends-card" key={friend.username}>
              <Link
                to={`/profile/` + friend.username}
                className="user-image-name-level"
              >
                <div className="user-image">
                  <div className="">
                    <img
                      src={
                        friend.avatar
                          ? process.env.VITE_BACKEND_API_URL + "" + friend.avatar
                          : profileIcon
                      }
                      alt=""
                      className="rounded-5 bg-info"
                    />
                  </div>
                </div>
                <div className="user-name-level">
                  <div className="user-name">
                    {friend?.first_name?.length
                      ? friend.first_name
                      : "?????????"}{" "}
                    {friend?.last_name?.length ? friend.last_name : "?????????"}
                  </div>
                  <div className="user-level">
                    lvl. {friend.level ? friend.level : 0}
                  </div>
                </div>
              </Link>
              <div className="invite-remove-button">
                <div
                  className="invite-button"
                  onClick={() => inviteToGame(friend.username!)}
                >
                  invite
                </div>
                <div
                  className="remove-button"
                  title="unfriend"
                  onClick={() => removeFriend(friend.username!)}
                >
                  <MdPersonRemoveAlt1 size={17} />
                </div>
              </div>
              <div
                className="collapse-button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <BsThreeDots size={30} color="white" />
              </div>
              <div className="dropdown-menu">
                {friend.is_blocked ? (
                  <div
                    className="block"
                    onClick={() => unblockUser(friend.username!)}
                  >
                    <span className="">
                      <CgUnblock color="green" size={25} />
                    </span>
                    unblock {friend.username}
                  </div>
                ) : (
                  <div
                    className="block"
                    onClick={() => blockUser(friend.username!)}
                  >
                    <span className="">
                      <MdOutlineBlock color="red" size={25} />
                    </span>
                    block {friend.username}!
                  </div>
                )}
                <Link
                  to={`/profile/` + friend.username}
                  className="view-profile"
                >
                  <span className="">
                    <img
                      src={
                        friend.avatar
                          ? process.env.VITE_BACKEND_API_URL + "" + friend.avatar
                          : profileIcon
                      }
                      width={20}
                      alt=""
                    />
                  </span>
                  view profile
                </Link>
              </div>
            </div>
          ))}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
    </div>
  );
};

export default Friends;
