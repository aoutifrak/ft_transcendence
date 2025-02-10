import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '../PingPongLocal/useGameLoop';
import { drawGame } from '..//PingPongLocal/gameRenderer';
import { updateGameState } from '../PingPongLocal/gameLogic';
import { GameState, INITIAL_GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../PingPongLocal/gameTypes';

interface PongProps {
  player1Name: string | null;
  player2Name: string | null;
  onGameEnd: (winner: string) => void; // Callback prop to pass winner back to Tournament
}

export const Tournamentpong: React.FC<PongProps> = ({ player1Name, player2Name, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isPaused, setIsPaused] = useState(true);
  const [showModeSelection, setShowModeSelection] = useState(true);
    const [gameMode, setGameMode] = useState<'local' | 'remote' | null>(null);
  const isTrue = useRef<boolean>(false);

  const handleLocalGame = () => {
    setGameMode('local');
    isTrue.current = true;
    setShowModeSelection(false);
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
          if (isTrue.current) {
            if (gameState.winner) {
              setGameState(INITIAL_GAME_STATE);
              setIsPaused(false);
              onGameEnd(gameState.winner); // Notify parent component of the winner
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
  }, [gameState.winner, onGameEnd]);

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
    <div className="flex flex-col items-center justify-center min-h-100 p-8">
      <div className="mb-8 flex items-center gap-32">
        <div className="flex items-center gap-4">
          <div className="text-white text-4xl font-semibold">{player1Name}</div>
          <div className="text-white text-6xl font-bold">{gameState.leftScore}</div>
        </div>
        <div className="text-white text-6xl font-bold">|</div>
        <div className="flex items-center gap-4">
          <div className="text-white text-6xl font-bold">{gameState.rightScore}</div>
          <div className="text-white text-4xl font-semibold">{player2Name}</div>
        </div>
      </div>
      <div className="relative p-[8px] bg-gradient-to-r from-[#3D096E] via-[#0C0638] via-70% to-[#060632] to-[79%] rounded-[9px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-[9px]"
        />
        {showModeSelection && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button 
              onClick={handleLocalGame}
              className="px-8 py-3 bg-[#ff3366] text-white rounded-lg hover:bg-[#ff3366]/80 transition-colors duration-240 font-semibold"
            >
              Play
            </button>
          </div>
        )}
      </div>

      {!showModeSelection && gameState.winner && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-4xl font-bold mb-4">{gameState.winner === 'Player 1' ? player1Name : player2Name} Wins!</p>
          <p className="text-xl">Press Space to Play Again</p>
        </div>
      )}

      {!showModeSelection && isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <p className="text-xl mb-2">
            {gameMode === 'local' ? "Press Space to Start" : ""}
          </p>
          <p className="text-sm opacity-75">
            {gameMode === 'local' ? "Player 1: W/S keys | Player 2: ↑/↓ keys" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tournamentpong;