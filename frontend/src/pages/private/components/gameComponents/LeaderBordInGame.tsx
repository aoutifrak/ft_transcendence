import { profileIcon, selverMedalLevel1Icon } from "@/media-exporting";
import { gameLeaderBoardInGame } from "../../styles";
import { useEffect, useState } from "react";
import { axiosPrivate } from "@/src/services/api/axios";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";

const LeaderBordInGame = () => {
  const [leaderBoardData, setLeaderBoardData] = useState<
    UserDataType[] | undefined
  >(undefined);
  const userData = useSelector((state: RootState) => state.user.value);
  useEffect(() => {
    const fetchLeaderBoardData = async () => {
      try {
        const res = await axiosPrivate.get("leaderboard");
        while (res.data.length < 6) {
          (res.data as UserDataType[]).push({
            avatar: undefined,
            username: "",
            score: 0,
            level: 0,
            medal: undefined,
            email: "",
            created_at: "",
            is2fa: false,
            is_online: false,
            is_blocked: false,
          });
        }
        setLeaderBoardData(res.data);
      } catch (err) {
        setLeaderBoardData(undefined);
      }
    };
    if (!leaderBoardData) fetchLeaderBoardData();
  }, [userData, leaderBoardData]);

  return (
    <>
      <div className={gameLeaderBoardInGame}>
        <table className="">
          <thead className="">
            <tr className="">
              <th className="">RANK</th>
              <th className="">Image</th>
              <th className="">NAME</th>
              <th className=" ">SCORE</th>
              <th className="">LEVEL</th>
              <th>MEDAL</th>
            </tr>
          </thead>
          <tbody className="">
            {!leaderBoardData || !leaderBoardData.length ? (
              <tr className="">
                <td colSpan={6}> No data in Leader board!!</td>
              </tr>
            ) : (
              leaderBoardData.map((player, index) => (
                <tr key={index} className="">
                  <th scope="col" className={player.username === "" ? "invisible" : ""}>
                    {Number(index) + 1}
                  </th>
                  {player.username !== "" ? (
                    <>
                      <td className="user-image-container">
                        <img
                          src={
                            player.avatar
                              ? process.env.VITE_BACKEND_API_URL +
                                "" +
                                player.avatar
                              : profileIcon
                          }
                          className="user-image"
                          alt="user image"
                        />
                      </td>
                      <td className="username">{player.username}</td>
                      <td className="score">{player.score}xp</td>
                      <td className="level">{player.level}</td>
                      <td className="">
                        <img
                          src={
                            player.medal
                              ? "/assets/icons/" + player.medal + ".svg"
                              : selverMedalLevel1Icon
                          }
                          className="medal-image"
                          alt="medal image"
                        />
                      </td>
                    </>
                  ) : 
                  ""
                  }
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LeaderBordInGame;
