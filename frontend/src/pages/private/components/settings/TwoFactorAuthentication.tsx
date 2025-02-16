import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import { useState } from "react";
import { twoFactorAuthentification } from "@privatePages/styles";
import ModalComponent from "@/src/router/layouts/components/ModalComponent";
import Modal from "react-modal";
import { setUserData } from "@/src/pages/modules/setAuthenticationData";
import {
  sendRequest2Fa,
  sendRequest2FaDeactivate,
} from "@/src/pages/modules/send2FaRequest";

const customStyles: Modal.Styles | undefined = {
  content: {},
  overlay: {
    margin: "0px",
    padding: "0px",
    maxHeight: "100%",
    maxWidth: "100%",
    backgroundColor: "rgba(0,0,0, 0.6)",
  },
};

const TwoFactorAuthentication = () => {
  const userData = useSelector((state: RootState) => state.user.value);
  const [srcQrconde, setSrcQrcode] = useState<React.SetStateAction<string>>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <div className={twoFactorAuthentification}>
        <ModalComponent
          id="qrModal"
          style={customStyles}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          shouldCloseOnOverlayClick={false}
        >
          <div className={`qr-code`}>
            <div
              className="close-modal"
              title="close"
              onClick={() => setIsOpen(false)}
            >
              x
            </div>
            <img src={srcQrconde.toString()} alt="QRCode image" className="" />
          </div>
        </ModalComponent>
        {userData.is2fa ? (
          <button
            type="button"
            className="two-factor-deactivation"
            onClick={async () => {
              await sendRequest2FaDeactivate();
              setSrcQrcode("");
              setUserData({ ...userData, is2fa: false });
            }}
          >
            Deactivate 2FA
          </button>
        ) : (
          <button
            type="button"
            className="two-factor-activation"
            onClick={async () => {
              setSrcQrcode(await sendRequest2Fa());
              setUserData({ ...userData, is2fa: true });
              setIsOpen(true);
            }}
          >
            Activate 2FA
          </button>
        )}
      </div>
    </>
  );
};
export default TwoFactorAuthentication;
