import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import { w3cwebsocket } from "websocket";
import Game from "@src/router/layouts/Game2";
import { isValidAccessToken } from "@/src/pages/modules/fetchingData";

const Match: React.FC = () => {
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<w3cwebsocket | null>(null);
  const AccessToken = useSelector((state: RootState) => state.accessToken.value);
  const userData = useSelector((state: RootState) => state.user.value);
  const username = userData.username;
  const level = userData.level;

  // Handle WebSocket connection and messages
  useEffect(() => {
    if (!AccessToken || !inQueue) return;

    if (connected === false) {
      if (isValidAccessToken(wsRef.current)) {
        // Check for existing active connection
        if (
          wsRef.current &&
          (wsRef.current.readyState === WebSocket.CONNECTING ||
            wsRef.current.readyState === WebSocket.OPEN)
        ) {
          return;
        }

        // Close existing connection before creating new one
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        // Create new WebSocket connection
        wsRef.current = new w3cwebsocket(
          `${process.env.VITE_BACKEND_API_SOCKETS}/ws/matchmaking/?token=${AccessToken}`
        );

        if (wsRef.current) {
          wsRef.current.onopen = () => {
            setConnected(true);
            wsRef.current?.send(
              JSON.stringify({
                type: "join_matchmaking",
                player_username: username,
                level: level,
              })
            );
          };

          wsRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data.toString());
              switch (data.type) {
                case "match_found":
                  setGameId(data.match);
                  handleLeaveQueue(); // Clean up queue when match is found
                  break;
                default:
                  break;
              }
            } catch (error) {
            }
          };

          wsRef.current.onclose = () => {
            setConnected(false);
            setInQueue(false);
          };
        }
      }
    }

    // Cleanup function
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [AccessToken, inQueue]);

  const handleStartQueue = (): void => {
    setInQueue(true);
  };

  const handleLeaveQueue = (): void => {
    setInQueue(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  };

  // Loading state component
  const LoadingIndicator = () => (
    <div className="mt-6 flex items-center justify-center space-x-2 text-gray-300">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#ffffff]-500"></div>
      <span className="text-sm">
        {connected ? "Finding match..." : "Connecting to server..."}
      </span>
    </div>
  );

  return gameId ? (
    <Game gameId={gameId} />
  ) : (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col gap-y-3.5 backdrop-blur-sm justify-center items-center bg-[#1a103f]/90 p-6 w-full max-w-md mx-auto rounded-lg border-2 border-[#ff3366] shadow-lg h-1/4">
        <h2 className="text-2xl font-bold mb-3 text-[#ffffff]">
          Matchmaking Queue
        </h2>

        <button
          onClick={inQueue ? handleLeaveQueue : handleStartQueue}
          disabled={!AccessToken}
          className={`px-8 py-3 text-white rounded-lg transition-colors duration-200 font-semibold ${
            !AccessToken
              ? "bg-gray-500 cursor-not-allowed"
              : inQueue
              ? "bg-blue-600 hover:bg-red-500"
              : "bg-[#ff3366] hover:bg-[#ff3366]/80"
          }`}
        >
          {inQueue ? "Leave Queue" : "Join Queue"}
        </button>

        {inQueue && <LoadingIndicator />}

        {!AccessToken && (
          <p className="text-red-400 text-sm mt-2">
            Please login to join matchmaking
          </p>
        )}
      </div>
    </div>
  );
};

export default Match;