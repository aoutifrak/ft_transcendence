import axios from "@/src/services/api/axios";

export const authenticateWithThirdParty = async (thirdParty: string) => {
  try {
    const test = await axios.post("oauth", { platform: thirdParty });
    window.location.href = test.data.url;
  } catch (err) {
  }
};
