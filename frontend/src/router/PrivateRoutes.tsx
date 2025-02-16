import { RootState } from "@states/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoutes = () => {
  const isAuthenticated = useSelector((state: RootState) => state.authenticator.value);
  const location = useLocation();
  return (isAuthenticated ? <Outlet/> : <Navigate state={{from : location}} to="sign-in" />);
};
export default PrivateRoutes;
