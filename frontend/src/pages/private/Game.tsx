import BackgroundCircles from "@/src/pages/private/components/gameComponents/BackgroundCircles";
import ProfileInGame from "@/src/pages/private/components/gameComponents/ProfileInGame";
import RecentInGame from "@/src/pages/private/components/gameComponents/RecentInGame";
import LeaderBordInGame from "@/src/pages/private/components/gameComponents/LeaderBordInGame";
import GameModeInGame from "@/src/pages/private/components/gameComponents/GameModeInGame";
import PongPlayerInGame from "./components/gameComponents/PongPlayerInGame";
import { game } from "./styles";
import SearchFriendsInGame from "./components/gameComponents/SearchFriendsInGame";
import { axiosPrivate } from "@/src/services/api/axios";
import { setUserData } from "../modules/setAuthenticationData";
import { useEffect } from "react";

const getUsersInfo = async () => {
  await axiosPrivate
    .get("user_info")
    .then((res) => {
      setUserData(res.data);
    })
    .catch((err) => {
      if (err.name === "CanceledError") return;
    });
};

const Game = () => {
  useEffect(() => {
    getUsersInfo();
  }, []);
  return (
    <>
      <div className={game}>
        <div className="" id="gameBackground">
          <BackgroundCircles />
        </div>
        <main className="game-container">
          <section className="searchFriends-pongPlayer-gameMode-leaderBoard-container">
            <div className="searchFriends-container">
              <SearchFriendsInGame />
            </div>
            <div className="pongPlayer-container">
              <PongPlayerInGame />
            </div>
            <div className="gameMode-container">
              <GameModeInGame />
            </div>
            <div className="leaderBoard-container">
              <LeaderBordInGame />
            </div>
          </section>
          <section className="profile-recentGames-container">
            <div className="profile-container">
              <ProfileInGame />
            </div>
            <div className="recentGames-container">
              <RecentInGame />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Game;
