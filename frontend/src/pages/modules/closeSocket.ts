import { w3cwebsocket } from "websocket";

export function closeSocket(socket: w3cwebsocket | null) {
  if (!socket) return;
  if (socket?.readyState !== w3cwebsocket.CLOSED && socket.readyState !== w3cwebsocket.CLOSING) {
    socket.close(1000,"close by alvares");
    return true;
  }
  return false;
}
