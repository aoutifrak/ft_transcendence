import { useSelector } from "react-redux";
import { recent } from "./styles";
import { RootState } from "@/src/states/store";
import { useEffect, useState } from "react";
import { axiosPrivate } from "@/src/services/api/axios";
import { useParams } from "react-router-dom";
import { PingPongLogoIcon, rocketLeageLogoIcon } from "@/media-exporting";

function getTimeFromAFullDate(date: string): string {
  const tmp = new Date(date);
  const hours = tmp.getUTCHours().toString().padStart(2, "0");
  const minutes = tmp.getUTCMinutes().toString().padStart(2, "0");
  const seconds = tmp.getUTCSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const Recent = () => {
  const [userRecentGames, setUserRecentGames] = useState<any[] | undefined>(
    undefined
  );
  const userData = useSelector((state: RootState) => state.user.value);
  const { userName } = useParams();
  const allUsersData = useSelector((state: RootState) => state.allUsers.value);
  useEffect(() => {
    const fetchUserRecentGames = async () => {
      try {
        let requestParams = {};
        if (userName)
          requestParams = {...requestParams, username: userName};
        const res = await axiosPrivate.get("user_recent_games",{params:requestParams});
        if (res.data) setUserRecentGames(res.data);
      } catch (err) {
        setUserRecentGames(undefined);
      }
    };
    if (!userRecentGames) fetchUserRecentGames();
  }, [userName, userData, allUsersData, userRecentGames]);
  if (!userRecentGames || !userRecentGames.length)
    return <div className="h4 text-warning"> No matches yet</div>;
  return (
    <div className={`${recent}`}>
      <div className="">
        {userRecentGames &&
          userRecentGames.length &&
          userRecentGames.map((match, index) => (
            <p className="" key={index}>
              <img
                src={
                  match.player1.type === "pong"
                    ? PingPongLogoIcon
                    : rocketLeageLogoIcon
                }
                alt=""
                className="d-inline"
              />
              <span
                className={`${
                  match.player1.winner === match.player1.name ? "win" : "lose"
                }`}
              >
                {match.player1.name}
              </span>
              {match.state} against
              <span
                className={`${
                  match.player2.winner === match.player2.name ? "win" : "lose"
                }`}
              >
                {" "}
                {match.player2.name}
              </span>
              <span className={"ml-4"}>
                {" "}
                {getTimeFromAFullDate(match.player2.updated_at)}
              </span>
            </p>
          ))}
      </div>
    </div>
  );
};

export default Recent;
