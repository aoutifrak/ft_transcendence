import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from './components/pingPong/useGameLoop';
import { drawGame } from './components/pingPong/gameRenderer';
import { updateGameState } from './components/pingPong/gameLogic';
import { GameState, INITIAL_GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from './components/pingPong/gameTypes';
import { isValidAccessToken } from "@/src/pages/modules/fetchingData";

import { w3cwebsocket } from "websocket";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import { useLocation, useNavigate } from 'react-router-dom';

export const PingPongLayout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [EndGame, setEndGame] = useState(false);
  const location = useLocation();
  const navigate = useNavigate()
  const gameId = location.state?.gameId;
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<w3cwebsocket | null>(null);

  const AccessToken = useSelector((state: RootState) => state.accessToken.value);
  const intervalRef = useRef<any | NodeJS.Timeout | null>(null);
  const winner = useRef<number>();
  const PlayerNumber = useRef<number>();
  const isPaused = useRef<boolean>(true);

  useEffect(() => {
    if (!AccessToken) return;

    if (connected == false)
      {
          if (isValidAccessToken(wsRef.current)) {
            if (wsRef.current && 
                (wsRef.current.readyState === WebSocket.CONNECTING || 
                 wsRef.current.readyState === WebSocket.OPEN)) {
              return;
            }
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            wsRef.current = new w3cwebsocket(
              `${process.env.VITE_BACKEND_API_SOCKETS}/ws/pong/${gameId}?token=${AccessToken}`
            );
          }

      if(wsRef.current) {
        wsRef.current.onopen = () => {
      setConnected(true);
    };
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            switch(data.type) {
                case 'game_ready':
                  isPaused.current = false;
                  break;
                  case 'player_number':
                    PlayerNumber.current = data.number;
                  break;
                  case 'ball_position':
                    setGameState(prev => ({ ...prev,
                      ballX: data.newBallX,
                      ballY: data.newBallY,
                      ballSpeedX: data.newBallSpeedX,
                      ballSpeedY: data.newBallSpeedY,
                      leftScore: data.leftScore,
                      rightScore: data.rightScore,
                      leftPaddleY: data.leftPaddleY,
                      rightPaddleY: data.rightPaddleY,
                      username1: data.name1,
                      username2: data.name2
                    }));
                    break;
                    case 'end_game':
                      setEndGame(true);
                      winner.current = data.winner;
                      break;
                      
                      default:
                      }
                      
          } catch (error) {
            }
          };
          
          wsRef.current.onclose = () => {
          setConnected(false)
        };
      }
    }
        let keys = {
          'up': false,
          'down': false
        }
          const handleKeyDown = (e: KeyboardEvent) => {
            if (wsRef.current)
              switch (e.key) {
                case 'w':
                  if (keys.up) return;
                  keys.up = true;
                  // Send movement to backend
                  wsRef.current.send(JSON.stringify({
                    type: 'paddle_move',
                    number: PlayerNumber.current,
                    keys: keys,
                  }));
                  break;
                  case 's':
                    if (keys.down) return;
                    keys.down = true;
                    wsRef.current.send(JSON.stringify({
                      type: 'paddle_move',
                        number: PlayerNumber.current,
                        keys: keys,
                      }));
                      break;
                    }
                  };

                  const handleKeyUp = (e: KeyboardEvent) => {
                    if (wsRef.current)
              if (e.key === 'w' || e.key === 's') {
                keys.down = false;
                keys.up = false;
                wsRef.current.send(JSON.stringify({
                  type: 'paddle_move',
                  number: PlayerNumber.current,
                  keys: keys
                }));
              }
          };

          window.addEventListener('keydown', handleKeyDown);
          window.addEventListener('keyup', handleKeyUp);

          return () => {

            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (wsRef.current)
              if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
              }
              clearInterval(intervalRef.current);
          };
    }, []);

  useEffect(() => {
    if (!gameId)
      navigate('/', {replace: true});
  }, [gameId])
  useGameLoop((deltaTime) => {
    if (isPaused.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setGameState(prev => updateGameState(prev, deltaTime));
    drawGame(ctx, gameState);
  });

  const handleGameEnd = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    navigate('/game', { 
      replace: true,
      state: { fromGame: true }
    });
  };
  
  useEffect(() => {
    if (EndGame) {
      handleGameEnd();
    }
  }, [EndGame]);

return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a103f] p-8">
      <div className="mb-8 flex items-center gap-32">
        <div className="flex items-center gap-4">
          <div className="text-white text-4xl font-bold">{gameState.leftScore}</div>
          <div className="text-white text-4xl font-bold">{gameState.username1}</div>
        </div>
        <div className="text-white text-6xl font-bold">|</div>
        <div className="flex items-center gap-4">
          <div className="text-white text-4xl font-bold">{gameState.rightScore}</div>
          <div className="text-white text-4xl font-bold">{gameState.username2}</div>
        </div>
      </div>
      {!EndGame && (
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#ff3366] rounded-lg shadow-[0_0_20px_rgba(255,51,102,0.3)]"
        />
      )}
      {isPaused.current && (
        <div className="mt-4 text-white text-center">
          <p className="text-xl mb-2">Waiting for opponent ....</p>
        </div>
      )}
      {EndGame && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {winner.current === PlayerNumber.current ? "You win!" : "You lose!"}
                </h2>
              </div>
            </div>
        )}
    </div>
  );
};

export default PingPongLayout;