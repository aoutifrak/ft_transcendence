import { gameIcon, profileIcon, tournamentIcon } from "@/media-exporting";
import { chatProfileStyles } from "@/src/router/styles";
import { useContext } from "react";
import { MdBlock } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import { blockUser, unblockUser } from "@/src/pages/modules/fetchingData";
import { ChatDataContext } from "@/src/customDataTypes/ChatDataContext";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { inviteToGame } from "@/src/pages/modules/inviteTogame";
import { inviteToTournament } from "@/src/pages/modules/inviteToTournament";

interface ProfileProps {
  isProfileVisible: boolean;
}

const Profile = ({ isProfileVisible }: ProfileProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const chatContext = useContext(ChatDataContext);
  if (!chatContext) throw new Error("it should be wraped inside a chatContext");
  const { userData, setUserData } = chatContext;

  if (
    !isProfileVisible ||
    location.pathname === "/chat" ||
    location.pathname === "/chat/"
  )
    return <></>;
  return (
    <>
      <div className={`${chatProfileStyles}`}>
        <div className="profileImage">
          <img
            src={
              userData?.avatar
                ? process.env.VITE_BACKEND_API_URL + userData.avatar
                : profileIcon
            }
            width={12}
            alt=""
          />
        </div>
        <button onClick={() => navigate("/profile/" + userData?.username)}>
          <div className="">
            <img src={profileIcon} alt="" />
          </div>
          <p className="">Profile</p>
        </button>
        <button onClick={() => inviteToGame(userData?.username!)}>
          <div className="">
            <img src={gameIcon} width={28} alt="" />
          </div>
          <p className="">Invite Ping Pong</p>
        </button>
        <button onClick={() => inviteToTournament()}>
          <div className="">
            <img src={tournamentIcon} width={28} alt="" />
          </div>
          <p className="">Warn Tournament</p>
        </button>
        {userData?.is_blocked ? (
          <button
            onClick={() => {
              unblockUser(userData?.username + "");
              setUserData({ ...userData, is_blocked: false } as UserDataType);
            }}
          >
            <div className="">
              <MdBlock size={"28"} />
            </div>
            <p className="">Unblock {userData?.username}</p>
          </button>
        ) : (
          <button
            onClick={() => {
              blockUser(userData?.username + "");
              setUserData({ ...userData, is_blocked: true } as UserDataType);
            }}
          >
            <div className="">
              <MdBlock size={"28"} />
            </div>
            <p className="">block {userData?.username}</p>
          </button>
        )}
      </div>
    </>
  );
};

export default Profile;
