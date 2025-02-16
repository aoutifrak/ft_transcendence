import history from "history/browser";
import { backwardAtHistory } from "../../styles";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation } from "react-router-dom";

const BackwardAtHistory = () => {
  const location = useLocation();
  if (location.pathname.split("/")[1] !== "profile") return "";
  return (
    <>
      <div className={backwardAtHistory} onClick={() => history.back()}>
        <MdArrowBackIosNew color="coral" size={32} className="" />
        <div className="">Back</div>
      </div>
    </>
  );
};

export default BackwardAtHistory;
