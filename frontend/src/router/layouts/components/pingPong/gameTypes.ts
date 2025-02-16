export interface GameState {
  leftPaddleY: number;
  rightPaddleY: number;
  username1: string;
  username2: string;
  leftPaddleDir: number;
  rightPaddleDir: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  leftScore: number;
  rightScore: number;
  winner: string | null;
  isPaused: boolean | true;
  ball_speed: number;
  paddle_speed: number;
  
}

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 700;

export const INITIAL_GAME_STATE: GameState = {
  leftPaddleY: CANVAS_HEIGHT / 2 - 50,
  rightPaddleY: CANVAS_HEIGHT / 2 - 50,
  leftPaddleDir: 0,
  rightPaddleDir: 0,
  ballX: CANVAS_WIDTH / 2 - 5,
  ballY: CANVAS_HEIGHT / 2 - 5,
  ballSpeedX: 1,
  ballSpeedY: 0,
  leftScore: 0,
  rightScore: 0,
  username1: '',
  username2: '',
  winner: null,
  isPaused: true,
  ball_speed: 400,
  paddle_speed: 400,
};