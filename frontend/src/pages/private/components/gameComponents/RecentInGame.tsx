import {
  PingPongLogoIcon,
  profileIcon,
  rocketLeageLogoIcon,
} from "@/media-exporting";
import { gameRecentInGame, gameRecentInGameImageAndName } from "../../styles";
import { useEffect, useState } from "react";
import { axiosPrivate } from "@/src/services/api/axios";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";

type PlayerInfoProps = {
  player: {
    name: string;
    avatar: string;
    scored: number;
    winner: string;
    loser: string;
    type: "pong" | "league";
  };
  isWinner: boolean;
};

const NameAndImageIcon = ({ player, isWinner }: PlayerInfoProps) => {
  return isWinner ? (
    <div className="winner">
      <div className={`user-image ${player.avatar === "" ? "invisible" : ""}`}>
        <img
          src={
            player.avatar
              ? process.env.VITE_BACKEND_API_URL + "" + player.avatar
              : profileIcon
          }
          alt="playerIcon"
          className={`bg-success ${player.avatar === "" ? "invisible" : ""}`}
        />
      </div>
      <div className={`user-name ${player.name === "" ? "invisible" : ""}`} title={player.name}>
        {player.name.length > 8 && player.name.substring(0, 6).concat("...")}
        {player.name.length <= 8 && player.name}
      </div>
    </div>
  ) : (
    <div className="loser">
      <div className={`user-name ${player.name === "" ? "invisible" : ""}`} title={player.name}>
        {player.name.length > 8 && player.name.substring(0, 6).concat("...")}
        {player.name.length <= 8 && player.name}
      </div>
      <div className={`user-image ${player.avatar === "" ? "invisible" : ""}`}>
        <img
          src={
            player.avatar
              ? process.env.VITE_BACKEND_API_URL + "" + player.avatar
              : profileIcon
          }
          alt="playerIcon"
          className={`bg-success ${player.avatar === "" ? "invisible" : ""}`}
        />
      </div>
    </div>
  );
};

const RecentInGame = () => {
  const [recentGames, setRecentGames] = useState<any[] | undefined>(undefined);
  const userData = useSelector((state: RootState) => state.user.value);
  useEffect(() => {
    const fetchrecentGames = async () => {
      try {
        const res = await axiosPrivate.get("recent_games");
        while (res.data.length < 10) {
          res.data.push({
            player1: {
              name: "",
              avatar: "",
              scored: 0,
              winner: "",
              loser: "",
              type: "pong",
            },
            player2: {
              name: "",
              avatar: "",
              scored: 0,
              winner: "",
              loser: "",
              type: "pong",
            },
          });
        }
        if (res.data) setRecentGames(res.data);
      } catch (err) {
        setRecentGames(undefined);
      }
    };
    if (!recentGames) fetchrecentGames();
  }, [userData, recentGames]);

  return (
    <>
      <div className={gameRecentInGame}>
        <div className="title">Recent</div>
        <div className="recent-board">
          {!recentGames ||
            (!recentGames.length && (
              <div className="h4 text-warning"> No matches yet</div>
            ))}
          {recentGames &&
            recentGames?.map((match, index) => (
              index < 10  ? 
              (<>
                <div key={index} className={gameRecentInGameImageAndName}>
                  <>
                    <NameAndImageIcon
                      player={
                        match.player1.name === match.player1.winner
                          ? match.player1
                          : match.player2
                      }
                      isWinner={true}
                    />
                    <div className={`vs-container ${match.player1.name === "" ? "invisible" : ""}`}>
                      <img
                        src={
                          match.player1.type === "pong"
                            ? PingPongLogoIcon
                            : rocketLeageLogoIcon
                        }
                        alt=""
                      />
                    </div>
                    <NameAndImageIcon
                      player={
                        match.player1.name === match.player1.loser
                          ? match.player1
                          : match.player2
                      }
                      isWinner={false}
                    />
                  </>
                </div>
              </>)
              :
              <></>
            ))}
        </div>
      </div>
    </>
  );
};

export default RecentInGame;
