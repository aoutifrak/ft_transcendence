import { Outlet } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { registrationLayout } from "@router/styles";
import { ballIcon } from "@/media-exporting";

const RegistrationLayout = () => {
  return (
    <Fragment>
      <div className={"d-flex overflow-x-hidden " + registrationLayout}>
        <div
          className="container row m-auto p-0  "
          style={{ height: "fit-content", minHeight: "40em" }}
        >
          <div className={`col-12 col-sm-11 col-md-10 col-lg-9 d-flex mx-0`}>
            <Outlet />
          </div>

          <div className="d-none d-sm-block col-sm-1 col-md-2 col-lg-3 p-0 pt-5 my-auto mx-0 h-100">
            <img
              src={ballIcon}
              alt="the ball icon"
              width="80em"
              className="float-end img-fluid m-0 mt-5"
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RegistrationLayout;
