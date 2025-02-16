import { notificationsComponent } from "@/src/router/styles";
import { axiosPrivate } from "@/src/services/api/axios";
import { useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { ToastContentProps, toast } from "react-toastify";

interface NotificationsComponentProps extends Partial<ToastContentProps> {
  message: string;
  toastName: string;
  notificationType?: string;
  reject?: () => void;
  accept?: () => void;
  gameId?: number;
  onClose?: ((reason?: string | boolean | undefined) => void) | undefined;
}

const NotificationsComponent = ({
  message,
  toastName,
  notificationType,
  reject,
  accept,
  gameId,
}: NotificationsComponentProps) => {
  const navigating = useNavigate();
  useEffect(() => {
    if (notificationType === "accept_invite") {
      toast.dismiss(toastName);
      navigating(`/pong`, { state: { gameId: gameId } });
    }
  }, []);
  if (!accept) {
    accept = () => {
      toast.dismiss(toastName);
      if (gameId)
        axiosPrivate
          .put("accept_invite", { game_id: gameId })
          .then()
          .catch((err) => {if (err.name === "CanceledError") return;});
      navigating(`/pong`, { state: { gameId: gameId } });
    };
  }
  if (!reject) {
    reject = () => {
      toast.dismiss(toastName);
    };
  }
  return (
    <>
      <div className={notificationsComponent}>
        <div className="notification-message-reject-accept">
          <div className="notification-message">{message}</div>
          <div className="notification-reject-accept">
            <div className="notification-reject" onClick={reject}>
              <ImCross color="red" />
            </div>
            <div className="notification-accept" onClick={accept}>
              <FaCheck color="greenyellow" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsComponent;
