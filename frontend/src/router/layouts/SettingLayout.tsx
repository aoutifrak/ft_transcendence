import { NavLink, Outlet } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { settingLayout } from "../styles";
import { profileIcon, settingBackgroundImage } from "@/media-exporting";
import { BiSearch } from "react-icons/bi";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";

const SettingLayout = () => {
  const userData = useSelector((state: RootState) => state.user.value)
  return (
    <Fragment>
      <div className={settingLayout}>
        <div className="input-field">
          <label htmlFor="searchSettings">
            <BiSearch size={22} color="white" className="search-add-on" />
          </label>
          <input
            type="text"
            name="search"
            id="searchSettings"
            placeholder="Search....."
          />
        </div>
        <section className="sectionOfSetting">
          <div className="user-background-image">
            <div className="background-img">
              <img src={settingBackgroundImage} alt="background image for setting" />
            </div>
            <div className="user-image">
              <img src={
                  userData.avatar
                    ? process.env.VITE_BACKEND_API_URL + "" + userData.avatar
                    : profileIcon
                } alt="image of user" className="" />
            </div>
          </div>
          <div className="setting-routes-outlets">
            <div className="setting-routes">
              <NavLink to={"profile"} className="">
                Profile
              </NavLink>
              <NavLink to={"password"} className="">
                Password
              </NavLink>
            </div>
            <div className="setting-outlets">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </Fragment>
  );
};

export default SettingLayout;
