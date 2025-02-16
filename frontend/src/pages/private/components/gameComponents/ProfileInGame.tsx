import {
  profileIcon,
  selverMedalLevel1Icon,
} from "@/media-exporting";
import { RiMenuSearchLine } from "react-icons/ri";
import { gameProfileInGame } from "../../styles";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";

const ProfileInGame = () => {
  const userData = useSelector((state: RootState) => state.user.value);
  return (
    <>
      <div className={gameProfileInGame}>
        <div className="profile-title">My Profile</div>
        <div className="medal-user">
          <div className="user-image-name-level">
            <div className="user-image">
              <img
                src={
                  userData.avatar
                    ? process.env.VITE_BACKEND_API_URL + "" + userData.avatar
                    : profileIcon
                }
                alt="my-profile"
                className=""
              />
            </div>
            <div className="user-name-level">
              <div className="user-name">{userData.username}</div>
              <p className="user-level">
                <RiMenuSearchLine /> level {userData.level ? userData.level : 0}
              </p>
            </div>
          </div>
          <div className="vertical-line"></div>
          <div className="medal-image">
            <img
              src={
                userData.medal
                  ? "/assets/icons/" + userData.medal + ".svg"
                  : selverMedalLevel1Icon
              }
              alt="medal Icon"
              className=""
            />
          </div>
        </div>
        <hr className="horizontal-line" />
        <div className="last-game-status-last-score">
          <div className="last-game">
            <div className="title">last Game</div>
            <div className="text-danger content">{userData.last_game}</div>
          </div>
          <div className=" vertical-line"></div>
          <div className="status">
            <div className="title">Status</div>
            <div
              className={`content ${
                userData.is_online ? "text-success" : "text-danger"
              }`}
            >
              {userData.is_online ? "online" : "offline"}
            </div>
          </div>
          <div className="vertical-line"></div>
          <div className="last-score">
            <div className="title">Score</div>
            <div className="text-success content">{userData.score}xp</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileInGame;
