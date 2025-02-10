export type BallState = {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    attachedTo: 'player1' | 'player2' | null;
  };

export type PlayerState = {
    username: string;
    x: number;
    y: number;
    angle: number;
    speed: number;
    connected: boolean;
  };

export type GameState = {
    player1: PlayerState;
    player2: PlayerState;
    ball: BallState;
    score: {
      player1: number;
      player2: number;
    };
    winner: number;
  };