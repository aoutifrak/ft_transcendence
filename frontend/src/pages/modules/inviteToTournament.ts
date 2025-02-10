import { axiosPrivate } from "@/src/services/api/axios";

export const inviteToTournament = async () => {
  try {
    await axiosPrivate.post("warn_tr");
  } catch (err) {}
};