import BackgroundCircles from "@/src/pages/private/components/gameComponents/BackgroundCircles";
import ProfileInGame from "@/src/pages/private/components/gameComponents/ProfileInGame";
import RecentInGame from "@/src/pages/private/components/gameComponents/RecentInGame";
import LeaderBordInGame from "@/src/pages/private/components/gameComponents/LeaderBordInGame";
import GameModeInGame from "@/src/pages/private/components/gameComponents/GameModeInGame";
import PongPlayerInGame from "./components/gameComponents/PongPlayerInGame";
import { game } from "./styles";
import SearchFriendsInGame from "./components/gameComponents/SearchFriendsInGame";

const Game = () => {
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
