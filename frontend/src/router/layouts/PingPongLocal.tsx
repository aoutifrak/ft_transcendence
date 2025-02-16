import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from './components/PingPongLocal/useGameLoop';
import { drawGame } from './components/PingPongLocal/gameRenderer';
import { updateGameState } from './components/PingPongLocal/gameLogic';
import { GameState, INITIAL_GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from './components/PingPongLocal/gameTypes';
import { useNavigate } from "react-router-dom";

export const Pong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isPaused, setIsPaused] = useState(true);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [gameMode, setGameMode] = useState<'local' | 'remote' | null>(null);
  const isTrue = useRef<boolean>(false);
  const isRemote = useRef<boolean>(false);
    const navigate = useNavigate();
  


  const handleLocalGame = () => {
    setGameMode('local');
    isTrue.current = true;
    setShowModeSelection(false);
  };
  
  const handleRemoteGame = () => {
    setGameMode('remote');
    isTrue.current = true;
    isRemote.current = true;
    setShowModeSelection(false);
    navigate('/PongMatchmaking');
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
          setGameState(prev => ({ ...prev, leftPaddleDir: -1 }));
          break;
          case 's':
            setGameState(prev => ({ ...prev, leftPaddleDir: 1 }));
            break;
            case 'ArrowUp':
              setGameState(prev => ({ ...prev, rightPaddleDir: -1 }));
              break;
              case 'ArrowDown':
                setGameState(prev => ({ ...prev, rightPaddleDir: 1 }));
                break;
                case ' ':
                  if(isTrue.current == true && isRemote.current == false) {
                    if (gameState.winner) {
                      setGameState(INITIAL_GAME_STATE);
                      setIsPaused(false);
                    } else {
                      setIsPaused(false);
                    }
                  }
                  break;
                  }
                };
                
                const handleKeyUp = (e: KeyboardEvent) => {
                  switch (e.key) {
                    case 'w':
                  case 's':
                    setGameState(prev => ({ ...prev, leftPaddleDir: 0 }));
                    break;
                    case 'ArrowUp':
                      case 'ArrowDown':
                        setGameState(prev => ({ ...prev, rightPaddleDir: 0 }));
                        break;
                      }
                    };
                    
                    window.addEventListener('keydown', handleKeyDown);
                    window.addEventListener('keyup', handleKeyUp);
                    
                    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.winner]);
  
  useGameLoop((deltaTime) => {
    if (isPaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setGameState(prev => updateGameState(prev, deltaTime));
    drawGame(ctx, gameState);
  });

return (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-[#03062E] to-[#5F0A94]">
  <div className="mb-8 flex items-center gap-32">
    <div className="flex items-center gap-4">
      <div className="text-white text-4xl font-semibold">Player-1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div className="text-white text-6xl font-bold">{gameState.leftScore}</div>
    </div>
    <div className="text-white text-6xl font-bold">|</div>
    <div className="flex items-center gap-4">
      <div className="text-white text-6xl font-bold">{gameState.rightScore}</div>
      <div className="text-white text-4xl font-semibold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Player-2</div>
    </div>
  </div>
    <div className="p-[8px] bg-gradient-to-r from-[#3D096E] via-[#0C0638] via-70% to-[#060632] to-[79%] rounded-[9px]">
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-[9px]"
    />
    </div>
    {!showModeSelection && gameState.winner && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-4xl font-bold mb-4">{gameState.winner} Wins!</p>
          <p className="text-xl">Press Space to Play Again</p>
        </div>
      )}
        
    {showModeSelection && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-[#1a103f]/90 p-8 rounded-lg border-2 border-[#ff3366] shadow-lg">
          <h2 className="text-white text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleLocalGame}
              className="px-8 py-3 bg-[#ff3366] text-white rounded-lg hover:bg-[#ff3366]/80 transition-colors duration-200 font-semibold"
            >
              Local Game
            </button>
            <button 
              onClick={handleRemoteGame}
              className="px-8 py-3 bg-[#7C5577] text-white rounded-lg hover:bg-[#7C5577]/80 transition-colors duration-200 font-semibold"
            >
              Remote Game
            </button>
          </div>
        </div>
      </div>
    )}

    {!showModeSelection && isPaused && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
        <p className="text-xl mb-2">
          {gameMode === 'local' ? "Press Space to Start" : ""}
        </p>
        <p className="text-sm opacity-75">
          {gameMode === 'local' ? "Player 1: W/S keys | Player 2: ↑/↓ keys" : "Waiting for opponent..."}
        </p>
      </div>
    )}
  </div>
);
};

export default Pong;
