import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import { w3cwebsocket } from "websocket";
import { useNavigate } from "react-router-dom";

const PongMatch: React.FC = () => {
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const wsRef = useRef<w3cwebsocket | null>(null);
  const AccessToken = useSelector(
    (state: RootState) => state.accessToken.value
  );
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user.value);
  const username = userData.username;
  const level = userData.level;
  useEffect(() => {
    if (gameId) navigate(`/pong`,{state: {gameId: gameId}});
  }, [gameId]);
  useEffect(() => {
    return () => {
      if (wsRef.current)
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
    };
  }, []);

  const handleStartQueue = (): void => {
    setInQueue(true);

    if (!AccessToken) return; // Don't initialize if no AccessToken

    wsRef.current = new w3cwebsocket(
      `${process.env.VITE_BACKEND_API_SOCKETS}/ws/PongMatch/?token=${AccessToken}`
    );

    wsRef.current.onopen = () => {
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
            break;
          default:
        }
      } catch (error) {
      }
    };

    wsRef.current.onclose = () => {
    };
  };

  const handleLeaveQueue = (): void => {
    setInQueue(false);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
  return (
    <div className="w-100 h-100 flex flex-col justify-center items-center ">
      <div className="flex flex-col gap-y-3.5  backdrop-blur-sm justify-center items-center bg-[#1a103f]/90 p-6 w-full max-w-md mx-auto rounded-lg border-2 border-[#ff3366] shadow-lg h-1/4 ">
        <h2 className="text-2xl font-bold mb-3 text-[#ffffff]">
          Matchmaking Queue
        </h2>

        <button
          onClick={inQueue ? handleLeaveQueue : handleStartQueue}
          className={`px-8 py-3 bg-[#ff3366] text-white rounded-lg hover:bg-[#ff3366]/80 transition-colors duration-200 font-semibold ${
            inQueue
              ? "bg-blue-600 hover:bg-red text-white"
              : "px-8 py-3 bg-[#ff3366] text-white rounded-lg hover:bg-[#ff3366]/80 transition-colors duration-200 font-semibold"
          }`}
        >
          {inQueue ? "Leave Queue" : "Join Queue"}
        </button>

        {inQueue && (
          <div className="mt-6 flex items-center justify-center space-x-2 text-gray-300">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#ffffff]-500"></div>
            <span className="text-sm">Finding match...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PongMatch;
