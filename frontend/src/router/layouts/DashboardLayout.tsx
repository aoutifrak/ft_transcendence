import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@privateComponents/Sidebar";
import { dashboardLayout } from "../styles";
import BackwardAtHistory from "./components/BackwardAtHistory";

const DashboardLayout = () => {
  return (
    <Fragment>
      <div className={`${dashboardLayout} `}>
        <Sidebar/>
        <div className="dashboard-outlets ">
          <Outlet />
          <div className="">
            <BackwardAtHistory/>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DashboardLayout;
