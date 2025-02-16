import setAuthenticatedData, {
  setUnAuthenticatedData,
} from "@/src/pages/modules/setAuthenticationData";
import axios from "../api/axios";

const refreshUrl = "refresh_token";

const refreshToken = () => {
  const refresh = async () => {
    let accessToken: string | undefined;
    try {
      const response = await axios.post(refreshUrl);
      accessToken = response.data.access_token;
      await axios.post("Verify_token",{token: accessToken});
      setAuthenticatedData(accessToken);
    } catch (err) {
      accessToken = undefined;
      setUnAuthenticatedData();
    } finally {
      return accessToken;
    }
  };
  return refresh;
};

export default refreshToken;
