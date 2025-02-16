import { profileIcon, selverMedalLevel1Icon } from "@/media-exporting";
import { gameLeaderBoardInGame } from "../../styles";
import { useEffect, useState } from "react";
import { axiosPrivate } from "@/src/services/api/axios";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";

const LeaderBordInGame = () => {
  const [leaderBoardData, setLeaderBoardData] = useState<UserDataType[] | undefined>(undefined);
  const userData = useSelector((state: RootState) => state.user.value);
  useEffect(() => {
    const fetchLeaderBoardData = async () => {
      try {
        const res = await axiosPrivate.get("leaderboard");
        if (res.data)
          setLeaderBoardData(res.data);
      } catch (err) {
        setLeaderBoardData(undefined)
      }
    }
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
              leaderBoardData.map((player, index) =>
                index < 6 ? (
                  <tr key={index} className="">
                    <th scope="col" className="">
                      {Number(index) + 1}
                    </th>
                    <td className="user-image-container">
                      <img
                        src={
                          player.avatar
                            ? process.env.VITE_BACKEND_API_URL + "" + player.avatar
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
                  </tr>
                ) : (
                  <tr key={index} className="d-none"></tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LeaderBordInGame;
