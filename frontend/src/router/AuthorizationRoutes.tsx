import { useSelector } from "react-redux";
import { RootState } from "../states/store";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthorizationRoutes = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.authenticator.value
  );
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const lastLocation = location.state?.from?.pathname
      ? location.state?.from?.pathname
      : "/profile";
    if (isAuthenticated) navigate(lastLocation, { replace: true });
  });
  return <Outlet />;
};

export default AuthorizationRoutes;
