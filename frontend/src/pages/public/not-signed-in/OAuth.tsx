import axios from "@/src/services/api/axios";
import { useLayoutEffect, useState } from "react";
import setAuthenticatedData from "../../modules/setAuthenticationData";
import { toast } from "react-toastify";
import ModalComponent from "@/src/router/layouts/components/ModalComponent";
import ModalOtp from "./ModalOtp";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const customStyles: Modal.Styles | undefined = {
  content: {
    padding: "0px",
    top: "0px",
    left: "0px",
  },
  overlay: {
    margin: "0px",
    padding: "0px",
    maxHeight: "100%",
    maxWidth: "100%",
  },
};

var first = true;
const OAuth = () => {
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  useLayoutEffect(() => {
    if (first) {
      first = false;
      handle42OauthCallback();
    }
  }, []);
  async function handle42OauthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      try {
        const res = await axios.get("socialauth", { params: { code } });
        if (res.data) {
          if (res.data["2fa"] === true) {
            setEmailForOtp(res?.data["email"]);
            setIsOpen(true);
          } else {
            if (!res.data.access)
              throw new Error("No access credentials provided");
          }
        }
        setAuthenticatedData(res.data.access);
      } catch (error) {
        toast.error("Error while trying to get the access credentials", {
          autoClose: 7000,
          containerId: "validation",
        });
        navigate("/sign-in", { replace: true });
      }
    } else {
      toast.error(
        "No code provided by 42 API please  check if you have permissions",
        {
          autoClose: 7000,
          containerId: "validation",
        }
      );
      navigate("/sign-in", { replace: true });
    }
  }

  return (
    <div>
      <ModalComponent
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        className=""
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        shouldFocusAfterRender={true}
        shouldReturnFocusAfterClose={true}
        shouldCloseOnEsc={true}
        id={`modalOtp`}
      >
        <ModalOtp email={emailForOtp} setIsOpen={setIsOpen} />
      </ModalComponent>
    </div>
  );
};

export default OAuth;
