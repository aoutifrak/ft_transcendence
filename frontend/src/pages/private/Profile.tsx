import { useOutletContext } from "react-router-dom";
import { profile } from "./styles";
import { UserDataType } from "@/src/customDataTypes/UserDataType";

const convertDateFormat = (isoDate: string | Date) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Profile = () => {
  const data: UserDataType | undefined = useOutletContext();
  return (
    <div className={`${profile}`}>
      <div className="">
        Player Name : {data?.first_name?.length ? data.first_name : "?????????"}{" "}
        {data?.last_name?.length ? data.last_name : "?????????"}
      </div>
      <div className="">Player Level : {data?.level ? data.level : 0}</div>
      <div className="">
        Started On :
        {convertDateFormat(data?.created_at ? data.created_at : new Date())}
      </div>
      <div className="">World Ranking : {data?.rank}</div>
      <div className="">Username : {data?.username}</div>
    </div>
  );
};

export default Profile;
