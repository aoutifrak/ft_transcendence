import { Fragment, useEffect, useState } from "react";
import { profileLayout } from "../styles";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import Stats from "./components/profile/Stats";
import { profileIcon } from "@/media-exporting";
import WaletState from "./components/profile/WaletStats";
import { RootState, store } from "@/src/states/store";
import { useSelector } from "react-redux";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { axiosPrivate } from "@/src/services/api/axios";
import { toast } from "react-toastify";

const ProfileLayout = () => {
  const { userName } = useParams();
  const currentUserData = useSelector((state: RootState) => state.user.value);
  const [data, setData] = useState<UserDataType>(currentUserData);
  const navigate = useNavigate();
  useEffect(() => {
    if (userName && userName !== currentUserData.username) {
      axiosPrivate
        .post("search_username", {
          username: userName,
        })
        .then((res) => {
          if (res.data?.error === "User matching query does not exist.")
          {
            toast.error("Error : no user with the username provided",{containerId:"validation", toastId: res.data.error + "profile"})
            navigate("/profile", {replace: true});
          }
          setData(res.data);
        })
        .catch((err) => {
          if (err.name === "CanceledError") return;
        });
    } else {
      setData(currentUserData);
    }
  }, [userName, currentUserData]);

  return (
    <Fragment>
      <div className={`${profileLayout}`}>
        <div className="aiStats">
          <Stats
            title={"Rocket League"}
            data={{
              win: data.league_wins ? data.league_wins : 0,
              lose: data.league_losses ? data.league_losses : 0,
            }}
          />
        </div>
        <div className="classicTournamentStats">
          <div className="classicStats">
            <Stats
              title={"Ping pong STATS"}
              data={{
                win: data.wins ? data.wins : 0,
                lose: data.losses ? data.losses : 0,
              }}
            />
          </div>
          <div className="tournamentStats">
            <Stats
              title={"TOURNAMENT STATS"}
              data={{
                win: 0,
                lose: 0,
              }}
            />
          </div>
        </div>
        <div className="profileStatsLayout">
          <div className="profile-side-bar">
            <NavLink
              className=""
              to={(userName ? userName + "/" : "") + "recent"}
            >
              Recent
            </NavLink>
            <NavLink
              className=""
              to={(userName ? userName + "/" : "") + "details"}
            >
              Profile
            </NavLink>
            {(!userName ||
              userName === store.getState().user.value.username) && (
              <>
                <NavLink className="" to="friends">
                  Friends
                </NavLink>
                <NavLink className="" to="requests">
                  requests
                </NavLink>
              </>
            )}
          </div>
          <div className="user-image-link-content">
            <div className="user-image">
              <div className="bg-dangesr">
                <img
                  src={
                    data.avatar
                      ? process.env.VITE_BACKEND_API_URL + "" + data.avatar
                      : profileIcon
                  }
                  alt="user image"
                />
              </div>
            </div>
            <div className="link-content">
              <Outlet context={data} />
            </div>
          </div>
        </div>
        <div className="waletStats">
          <WaletState data={data} />
        </div>
      </div>
    </Fragment>
  );
};

export default ProfileLayout;
