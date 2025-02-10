import { w3cwebsocket } from "websocket";
import { useEffect, useState } from "react";
import { openSocket } from "@/src/pages/modules/openSocket";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import { isValidAccessToken } from "@/src/pages/modules/fetchingData";

interface useHandleSocketsProps {
  urlOfSocket: string;
  accessToken?: string;
  watchSocket?: (a : w3cwebsocket | null) => void;
}

const useHandleSockets = ({
  urlOfSocket,
  accessToken,
  watchSocket
}: useHandleSocketsProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.authenticator.value)
  const [client, setClient] = useState<w3cwebsocket | null>(null);
  const handleSockets = async () => {
    if (!client || (client.readyState !== w3cwebsocket.OPEN && client.readyState !== w3cwebsocket.CONNECTING))
    {
      if (isValidAccessToken(client))
        setClient(openSocket(urlOfSocket, accessToken));
    }
    if (client) {
      watchSocket && watchSocket(client);
      client.onclose = () => {
        if (client.readyState === w3cwebsocket.CLOSED || client.readyState === w3cwebsocket.CLOSING)
          setClient(null);
      }
    }
  };
  useEffect(() => {
    if (isAuthenticated)
      handleSockets();
  }, [isAuthenticated, accessToken]);
  return { client, setClient };
};

export { useHandleSockets };
