import { w3cwebsocket } from "websocket";

export function openSocket(
  socketConnectionEndPoint: string,
  accessToken: string | undefined
): w3cwebsocket | null {
  if (accessToken)
    return new w3cwebsocket(
    `${process.env.VITE_BACKEND_API_SOCKETS}/ws/${socketConnectionEndPoint}/?token=${accessToken}`
  );
  return null;
}
