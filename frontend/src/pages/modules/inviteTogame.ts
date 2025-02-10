import { axiosPrivate } from "@/src/services/api/axios";

export const inviteToGame = async (username: string) => {
  try {
    await axiosPrivate.get("matchmaking", {
      params: { username: username },
    });
  } catch (err) {}
};
