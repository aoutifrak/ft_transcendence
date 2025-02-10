// Game.tsx
import React, { useRef, useEffect, useState } from "react";
import { GameState } from './components/league/types';
import { renderGame } from './components/league/renderer';
import { w3cwebsocket } from "websocket";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface GameProps {
	gameId: number;
}

const Game: React.FC<GameProps> = ({gameId}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<w3cwebsocket | null>(null);
  const animationFrameId = useRef<number>();
  const playerNum = useRef<number>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const AccessToken = useSelector((state: RootState) => state.accessToken.value);
  const [endGame, setEndGame] = useState(false);
  const navigate = useNavigate();


  const dimensions = {
    canvasWidth: 800,
    canvasHeight: 500,
    playerWidth: 40,
    playerHeight: 40
  };

  // Set up WebSocket connection and handle messages
  useEffect(() => {
    if (!AccessToken) return; // Don't initialize if no AccessToken

    wsRef.current = new w3cwebsocket(
      `${process.env.VITE_BACKEND_API_SOCKETS}/ws/league/${gameId}?token=${AccessToken}`
    );

    wsRef.current.onopen = () => {
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
          
        switch(data.type) {
          case 'player_number':
            playerNum.current = data.number;
            // setGameState(data.game_state as GameState);
            break;
            case 'game_state':
              setGameState(data.game_state as GameState);
              if (data.game_state.winner) {
                setEndGame(true);
              }
          break;
          default:
          }
          
      } catch (error) {
      }
    };

    wsRef.current.onclose = () => {
    };

    let keys = {
      move: false,
      left: false,
      right: false,
      shoot: false,
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'w':
            if (keys.move) return;
            keys.move = true;
            wsRef.current?.send(JSON.stringify({
              type: 'input',
              keys: keys,
              player: playerNum.current,
            }));
            break;
          case 'a':
            if (keys.left) return;
            keys.left = true;
            wsRef.current?.send(JSON.stringify({
              type: 'input',
              keys: keys,
              player: playerNum.current,
            }));
            break;
          case 'd':
            if (keys.right) return;
            keys.right = true;
            wsRef.current?.send(JSON.stringify({
              type: 'input',
              keys: keys,
              player: playerNum.current,
            }));
            break;
            case ' ':
              if (keys.shoot) return;
              keys.shoot = true;
              wsRef.current?.send(JSON.stringify({
                type: 'input',
                keys: keys,
                player: playerNum.current,
              }));
          }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
          keys.move = false;
          wsRef.current?.send(JSON.stringify({
            type: 'input',
            player: playerNum.current,
            keys: keys,
          }));
          break;
        case 'a':
          keys.left = false;
          wsRef.current?.send(JSON.stringify({
            type: 'input',
            player: playerNum.current,
            keys: keys,
          }));
          break;
        case 'd':
          keys.right = false;
          wsRef.current?.send(JSON.stringify({
            type: 'input',
            player: playerNum.current,
            keys: keys,
          }));
          break;
          case ' ':
            keys.shoot = false;
            wsRef.current?.send(JSON.stringify({
              type: 'input',
              player: playerNum.current,
              keys: keys,
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
    };
  }, []);

  // Render game state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      renderGame(ctx, dimensions, gameState.player1, gameState.player2, gameState.ball);
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, dimensions]);

  const handleHome = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    navigate('/');
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      {!endGame && (
        <div className="relative flex flex-col items-center">
          {!gameState ? (
            <div className="text-white text-2xl font-bold">Waiting for opponent...</div>
          ) : (
            <>
              <div className="absolute top-4 text-white text-2xl font-bold">
                {gameState.player1.username} : {gameState.score.player1} - {gameState.player2.username} : {gameState.score.player2}
              </div>
              <canvas
                ref={canvasRef}
                width={dimensions.canvasWidth}
                height={dimensions.canvasHeight}
                style={{
                  border: "8px solid #C850C0",
                  borderRadius: "9px"
                }}
              />
            </>
          )}
        </div>
      )}
      {endGame && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {gameState?.winner === playerNum.current ? "You win" : "You lose"}
            </h2>
            <button
              onClick={handleHome}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );  
  
};

export default Game;