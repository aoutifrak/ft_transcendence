import refreshToken from "@/src/services/hooks/refreshToken";
import { RootState } from "@/src/states/store";
import { useLayoutEffect, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { setUnAuthenticatedData } from "./pages/modules/setAuthenticationData";
import { useAxiosPrivate } from "./services/hooks/useAxiosPrivate";

interface PersistLoginProps {
  children: any;
}

const PersistLogin = ({ children }: PersistLoginProps) => {
  useAxiosPrivate();
  const [isLoading, setIsLoading] = useState(true);
  const refresh = refreshToken();
  const accessToken = useSelector(
    (state: RootState) => state.accessToken.value
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.authenticator.value
  );

  useLayoutEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        if (Cookies.get("accessToken") !== undefined) await refresh();
        else throw new Error("No access token in Cookies");
      } catch (err) {
        setUnAuthenticatedData();
      } finally {
        isMounted && setIsLoading(false);
      }
    };
    !accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return <>{isLoading ? <p>Loading...</p> : children}</>;
};

export default PersistLogin;
