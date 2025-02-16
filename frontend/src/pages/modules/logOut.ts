import { redirect } from "react-router-dom";
import { setUnAuthenticatedData } from "@/src/pages/modules/setAuthenticationData";
import { axiosPrivate } from "@/src/services/api/axios";
const logOut = async () => {
  try {
    await axiosPrivate.post("logout");
    setUnAuthenticatedData();
  } catch (err) {
  }
  return redirect("/sign-in");
};

export default logOut;
