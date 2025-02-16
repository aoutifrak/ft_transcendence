import { coinsBackground, profileIcon } from "@/media-exporting";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import { profileWaletStats } from "@/src/router/styles";
import { LiaCoinsSolid } from "react-icons/lia";
import { RiCoinsLine } from "react-icons/ri";

interface WaletStatsProps {
  data: UserDataType | undefined;
}

const WaletStats = ({ data }: WaletStatsProps) => {
  return (
    <>
      <div className={`${profileWaletStats}`}>
        <div className="user-image-name-level">
          <div className="user-image">
            <div className="">
              <img
                src={
                  data?.avatar
                    ? process.env.VITE_BACKEND_API_URL + "" + data.avatar
                    : profileIcon
                }
                alt=""
                className="rounded-5 bg-info"
              />
            </div>
          </div>
          <div className="user-name-level">
            <div className="user-name">
              {(data?.first_name?.length ? data.first_name : "?????????") +
                " " +
                (data?.last_name?.length ? data.last_name : "?????????")}
            </div>
            <div className="user-level">
              {" "}
              lvl. {data?.level ? data.level : 0}
            </div>
          </div>
        </div>
        <div className="walet-cents-coins">
          <img src={coinsBackground} alt="" className="" />
          <div className="walet-cents">
            <LiaCoinsSolid size={25} /> 255458961456
          </div>
          <div className="walet-coins">
            <RiCoinsLine size={25} color="" style={{ marginRight: "2px" }} />
            251
          </div>
        </div>
      </div>
    </>
  );
};

export default WaletStats;
