import { axiosPrivate } from "@/src/services/api/axios";
import QRCode from "qrcode";

const sendRequest2Fa = async (): Promise<string> => {
  try {
    const response = await axiosPrivate.post("enable2fa");
    return await QRCode.toDataURL(response.data.otp);
  } catch (err) {
  }
  return "";
};

const sendRequest2FaDeactivate = async (): Promise<void> => {
  try {
    await axiosPrivate.get("enable2fa");
  } catch (err) {
  }
};

export { sendRequest2Fa, sendRequest2FaDeactivate };
