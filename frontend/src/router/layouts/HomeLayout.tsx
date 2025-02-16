import { Outlet } from "react-router-dom";
import Navbar from "@publicComponents/Navbar";
import { homeLayout } from "../styles";

const HomeLayout = () => {
  return (
    <>
      <div className={` ${homeLayout}`}>
        <header>
          <Navbar></Navbar>
        </header>
        <Outlet />
      </div>
    </>
  );
};
export default HomeLayout;
