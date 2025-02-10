import { BiBlock, BiSearch } from "react-icons/bi";
import { searchFriendsInGame } from "../../styles";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { profileIcon } from "@/media-exporting";
import { RiUserAddFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { RootState, store } from "@/src/states/store";
import { AllUsersDataType } from "@/src/states/authentication/allUsersSlice";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import {
  acceptFriendRequest,
  blockUser,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from "@/src/pages/modules/fetchingData";
import { FaUserCheck, FaUserClock } from "react-icons/fa";
import { FiUserX } from "react-icons/fi";
import NotificationsInGame from "./NotificationsInGame";
import { useInfiniteScroll } from "@/src/services/hooks/useInfiniteScroll";
import { setAllUsersData } from "@/src/pages/modules/setAuthenticationData";
import { axiosPrivate } from "@/src/services/api/axios";
import { AxiosResponse } from "axios";
import LoadingOrNoMoreData from "@/src/pages/components/LoadingOrNoMoreData";

let isInputFocused: boolean = false;
let isDevFocused: boolean = false;
const hideSearchList = () => {
  let selectSearchList = document.querySelector(".searched-users-list");
  if (isInputFocused === false && isDevFocused === false) {
    if (!selectSearchList?.classList.contains("d-none"))
      selectSearchList?.classList.add("d-none");
  }
};
const showSearchList = () => {
  let selectSearchList = document.querySelector(".searched-users-list");
  if (selectSearchList?.classList.contains("d-none"))
    selectSearchList?.classList.remove("d-none");
};

function searchForUser(
  event: ChangeEvent<HTMLInputElement>,
  users: AllUsersDataType[],
  setUsers: React.Dispatch<React.SetStateAction<AllUsersDataType[]>>
) {
  event.preventDefault();
  let userField = event.currentTarget.value;
  let globalData = store.getState();
  let filteredUsers = globalData.allUsers.value.filter((filteredUser) => {
    let filteredUserToLowerCase = filteredUser.username?.toLowerCase();
    return (
      filteredUserToLowerCase?.includes(userField.toLowerCase()) &&
      filteredUserToLowerCase !== globalData.user.value.username?.toLowerCase()
    );
  });
  if (filteredUsers.length) setUsers(filteredUsers);
  else if (users.length) setUsers([]);
}

interface BlockingFriendingButtonsProps {
  setUsers?: React.Dispatch<React.SetStateAction<any>>;
  user: AllUsersDataType;
}

const BlockingFriendingButtons = ({ user }: BlockingFriendingButtonsProps) => {
  return (
    <>
      <div className="block-addFriend-buttons">
        {user.is_friend ? (
          <div
            className="unfriend-button"
            title={`remove friend ${user.username}`}
            onClick={() => removeFriend(user.username)}
          >
            <MdPersonRemoveAlt1 />
          </div>
        ) : (
          <>
            {user.is_friend_req ? (
              user.is_friend_req === "sent" ? ( //sent request
                <div
                  className="add-button cancel-request"
                  title="cancel request"
                  onClick={() => rejectFriendRequest(user.username)}
                >
                  <FaUserClock />
                </div>
              ) : (
                //received request
                <>
                  <div
                    className="add-button accept-request"
                    title="accept request"
                    onClick={() => acceptFriendRequest(user.username)}
                  >
                    <FaUserCheck />
                  </div>
                  <div
                    className="add-button reject-request"
                    title="reject request"
                    onClick={() => rejectFriendRequest(user.username)}
                  >
                    <FiUserX />
                  </div>
                </>
              )
            ) : (
              <div
                className="add-button send-request"
                onClick={() => sendFriendRequest(user.username)}
              >
                <RiUserAddFill />
              </div>
            )}
          </>
        )}
        {user.is_blocked ? (
          <div
            className="remove-block"
            title={`unblock ${user.username}`}
            onClick={() => unblockUser(user.username)}
          >
            <CgUnblock />
          </div>
        ) : (
          <div
            className="block-button"
            title={`block ${user.username}`}
            onClick={() => blockUser(user.username)}
          >
            <BiBlock />
          </div>
        )}
      </div>
    </>
  );
};

const fetchingAllUsersData = (
  url: string,
  page?: number,
  username?: string
): Promise<AxiosResponse<any,any>> => {
  let requestParams = {}
  if (page)
    requestParams = {...requestParams, page: page};
  if (username)
    requestParams = {...requestParams, username: username};
  return axiosPrivate.post(url,{},{params: requestParams});
};

const SearchFriendsInGame = () => {
  const [users, setUsers] = useState<AllUsersDataType[]>([]);
  const allUsersData = useSelector((state: RootState) => state.allUsers.value);
  const refSearchFriendsInGame = useRef<HTMLDivElement>(null);
  const usersStartRef = useRef<HTMLDivElement>(null);
  const { isLoading, hasMore, handleScroll } = useInfiniteScroll<AllUsersDataType>({
    url: "search_user",
    refElement: refSearchFriendsInGame.current,
    startPositionRef: usersStartRef.current,
    data: allUsersData,
    setData: setAllUsersData,
    offset: 50,
    scrollDirection: "bottom",
    fetchingData: fetchingAllUsersData,
  });
  useEffect(() => {
    setUsers(allUsersData);
    return () => {
      isInputFocused = false;
      isDevFocused = false;
    }
  }, [allUsersData]);

  return (
    <div className={searchFriendsInGame}>
      <div className="input-field">
        <label htmlFor="searchUsers">
          <BiSearch size={22} color="white" className="search-add-on" />
        </label>
        <input
          type="text"
          name="searchUsers"
          id="searchUsers"
          className="searchUsers"
          placeholder="Search for users....."
          autoComplete="off"
          onChange={(event) => {
            searchForUser(event, users, setUsers);
          }}
          onFocus={() => {
            isInputFocused = true;
            showSearchList();
          }}
          onBlur={() => {
            isInputFocused = false;
            hideSearchList();
          }}
        />
      </div>
      <div
        className="searched-users-list d-none"
        tabIndex={0}
        onMouseEnter={() => (isDevFocused = true)}
        onMouseLeave={() => (isDevFocused = false)}
        onFocus={() => showSearchList()}
        onBlur={() => {
          isDevFocused = false;
          hideSearchList();
        }}
        onScroll={handleScroll}
        ref={refSearchFriendsInGame}
      >
        <div ref={usersStartRef} />
        {users && users.length ? (
          users.map((user, index) => (
            <div className="searched-users-cards" key={index}>
              <Link
                to={`/profile/` + user.username}
                className="user-image-first-last-name"
              >
                <div className="user-image">
                  <div className="">
                    <img
                      src={
                        user.avatar
                          ? process.env.VITE_BACKEND_API_URL + user.avatar
                          : profileIcon
                      }
                      alt=""
                      className="rounded-5 bg-info"
                    />
                  </div>
                </div>
                <div className="user-first-last-name">
                  <div className="first-last-name">
                    {user.first_name + " " + user.last_name}
                  </div>
                  <div className="user-name">{user.username}</div>
                </div>
              </Link>
              <BlockingFriendingButtons user={user} />
            </div>
          ))
        ) : (
          <></>
        )}
        <LoadingOrNoMoreData isLoading={isLoading} hasMore={hasMore} />
      </div>
      <NotificationsInGame />
    </div>
  );
};

export default SearchFriendsInGame;
