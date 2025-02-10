import { NavLink } from "react-router-dom";
import {
  brandIcon,
  chatIcon,
  gameIcon,
  homeIcon,
  profileIcon,
  settingsIcon,
  tournamentIcon,
} from "@/media-exporting";
import { sidebar } from "../styles";

const Sidebar = () => {
  return (
    <>
      <div className={`${sidebar}`}>
        <div className="sidebar-content">
          <div className="brand-icon">
            <img
              src={brandIcon}
              alt="brandIcon"
              className=""
              title="brandLogo"
            />
          </div>
          <NavLink to={"/"} className=" ">
            <div className="link-icon">
              <img src={homeIcon} alt="homeIcon" className="" title="home" />
            </div>
          </NavLink>
          <NavLink to={"/profile"} className="">
            <div className="link-icon">
              <img
                src={profileIcon}
                alt="profileIcon"
                className=""
                title="profile"
              />
            </div>
          </NavLink>
          <NavLink to={"/game"} className="">
            <div className="link-icon">
              <img src={gameIcon} alt="gameIcon" className="" title="game" />
            </div>
          </NavLink>
          <NavLink to={"/chat"} className="">
            <div className="link-icon">
              <img src={chatIcon} alt="chatIcon" className="" title="chat" />
            </div>
          </NavLink>
          <NavLink to={"/tournament"} className="">
            <div className="link-icon">
              <img
                src={tournamentIcon}
                alt="tournamentIcon"
                className=""
                title="tournament"
              />
            </div>
          </NavLink>
          <NavLink to={"/setting"} className=" mb-5">
            <div className="link-icon">
              <img
                src={settingsIcon}
                alt="settingsIcon"
                className=""
                title="settings"
              />
            </div>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
