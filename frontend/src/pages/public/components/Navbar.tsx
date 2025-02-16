import { NavLink } from "react-router-dom";
import { brandIcon, profileIcon } from "@/media-exporting.ts";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import Dropdown, { Links } from "@pages/components/Dropdown";
import logOut from "../../modules/logOut";

const dropdownLinks: Links[] = [
  {
    className: "py-2 mx-0",
    link: (
      <NavLink to="game" className="">
        game
      </NavLink>
    ),
  },
  {
    className: "py-2 mx-0",
    link: (
      <NavLink to="profile" className="">
        profile
      </NavLink>
    ),
  },
  {
    className: "py-2 mx-0",
    link: (
      <NavLink to="chat" className="">
        chat
      </NavLink>
    ),
  },
  {
    className: "py-2 mx-0",
    link: (
      <NavLink to="setting" className="">
        setting
      </NavLink>
    ),
  },
  {
    className: "py-2 mx-0",
    link: (
      <button type="button" className="btn btn-danger" onClick={logOut}>
        logout
      </button>
    ),
  },
];

const Navbar = () => {
  const isAuthenticated: boolean = useSelector(
    (state: RootState) => state.authenticator.value
  );
  const userData = useSelector(
    (state: RootState) => state.user.value
  );

  return (
    <>
      <div className="container-fluid d-flex flex-row justify-content-between pb-0 pt-2 ">
        <div className="my-auto" style={{ height: "100px" }}>
          <img
            className="img-fluid m-0 p-0"
            src={brandIcon}
            width="100%"
            height="auto"
            alt="brand"
          />
        </div>
        <div className={"mt-2 ms-auto"}>
          {!isAuthenticated && (
            <NavLink
              style={{ width: "100px" }}
              className="bg-success d-inline-flex rounded-pill py-1 px-3 mt-2 me-3"
              to="/sign-up"
            >
              SIGN UP
            </NavLink>
          )}
          {isAuthenticated && (
            <Dropdown className="" linksDetails={dropdownLinks}>
              <img src={
                userData.avatar
                ? process.env.VITE_BACKEND_API_URL + "" + userData.avatar
                : profileIcon
              }
                alt="User image"
                className="bg-success"
                style={{ width:"60px", height:"",borderRadius:"100%"  }}
              />
            </Dropdown>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
