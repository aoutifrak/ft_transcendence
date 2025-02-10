import axios from "@/src/services/api/axios";
import { useLayoutEffect, useState } from "react";
import setAuthenticatedData from "../../modules/setAuthenticationData";
import { toast } from "react-toastify";
import ModalComponent from "@/src/router/layouts/components/ModalComponent";
import ModalOtp from "./ModalOtp";
import Modal from "react-modal";

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

const OAuth = () => {
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useLayoutEffect(() => {
    handle42OauthCallback();
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
        window.location.replace("/sign-up");
        window.location.href = "/sign-up";
      }
    } else {
      window.location.replace("/sign-up");
      window.location.href = "/sign-up";
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
