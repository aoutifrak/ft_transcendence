import { GameState, CANVAS_WIDTH, CANVAS_HEIGHT } from './gameTypes';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 10;

class BallResetManager {
  private static instance: BallResetManager;
  private isGoingRight: boolean = true;

  private constructor() {}

  static getInstance(): BallResetManager {
    if (!BallResetManager.instance) {
      BallResetManager.instance = new BallResetManager();
    }
    return BallResetManager.instance;
  }

  resetBall(): [number, number, number, number] {
    this.isGoingRight = !this.isGoingRight;
    const direction = this.isGoingRight ? 1 : -1;

    return [
      CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
      direction,
      (Math.random() - 0.5) * 2,
    ];
  }
}

const ballManager = BallResetManager.getInstance();

export const updateGameState = (state: GameState, deltaTime: number): GameState => {
  
  if (state.winner) {
    return state;
  }
  
  const newLeftPaddleY = Math.max(
    0,
    Math.min(
      CANVAS_HEIGHT - PADDLE_HEIGHT,
      state.leftPaddleY + state.leftPaddleDir * state.paddle_speed * deltaTime
    )
  );
  
  const newRightPaddleY = Math.max(
    0,
    Math.min(
      CANVAS_HEIGHT - PADDLE_HEIGHT,
      state.rightPaddleY + state.rightPaddleDir * state.paddle_speed * deltaTime
    )
  );
  
  const nextBallX = state.ballX + state.ballSpeedX * state.ball_speed * deltaTime;
  const nextBallY = state.ballY + state.ballSpeedY * state.ball_speed * deltaTime;
  let newBallSpeed = state.ball_speed;
  let newPaddleSpeed = state.paddle_speed;
  
  let newBallX = state.ballX;
  let newBallY = state.ballY;
  let newBallSpeedX = state.ballSpeedX;
  let newBallSpeedY = state.ballSpeedY;
  let leftScore = state.leftScore;
  let rightScore = state.rightScore;
  
  if (nextBallY <= 0) {
    newBallY = Math.abs(nextBallY);
    newBallSpeedY = Math.abs(newBallSpeedY);
  } else if (nextBallY >= CANVAS_HEIGHT - BALL_SIZE) {
    const excess = nextBallY - (CANVAS_HEIGHT - BALL_SIZE);
    newBallY = (CANVAS_HEIGHT - BALL_SIZE) - excess;
    newBallSpeedY = -Math.abs(newBallSpeedY);
  } else {
    newBallY = nextBallY;
  }
  
  newBallX = nextBallX;
  
  if (
    newBallX <= PADDLE_WIDTH &&
    newBallY + BALL_SIZE >= newLeftPaddleY &&
    newBallY <= newLeftPaddleY + PADDLE_HEIGHT
  ) {
    newBallX = PADDLE_WIDTH + 1;
    newBallSpeedX = -newBallSpeedX;
    
    const paddleCenter = newLeftPaddleY + PADDLE_HEIGHT / 2;
    let hitPosition = newBallY - paddleCenter;
    
    if (Math.abs(hitPosition) < (PADDLE_HEIGHT * 0.1)) {
      hitPosition = (Math.random() < 0.5 ? -1 : 1) * PADDLE_HEIGHT * 0.25;
    }

    const directionMultiplier = hitPosition / (PADDLE_HEIGHT / 2);
    newBallSpeedY = Math.abs(newBallSpeedX) * directionMultiplier;
    if(state.ball_speed < 800)
      newBallSpeed += 20; 
  }
  
  if (
    newBallX >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
    newBallY + BALL_SIZE >= newRightPaddleY &&
    newBallY <= newRightPaddleY + PADDLE_HEIGHT
  ) {
    newBallX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE - 1;
    newBallSpeedX = -newBallSpeedX;
    
    const paddleCenter = newRightPaddleY + PADDLE_HEIGHT / 2;
    let hitPosition = newBallY - paddleCenter;
    
    if (Math.abs(hitPosition) < (PADDLE_HEIGHT * 0.1)) {
      hitPosition = (Math.random() < 0.5 ? -1 : 1) * PADDLE_HEIGHT * 0.25;
    }
    
    const directionMultiplier = hitPosition / (PADDLE_HEIGHT / 2);
    newBallSpeedY = Math.abs(newBallSpeedX) * directionMultiplier;
    if(state.ball_speed < 800)
      newBallSpeed += 20; 
  }
  
  
  if (newBallX <= 0) {
    rightScore++;
    // newBallSpeed += 20;
    // newPaddleSpeed += 6;
    newBallSpeed = 400; 
    // newBallSpeed = state.ball_speed; 
    [newBallX, newBallY, newBallSpeedX, newBallSpeedY] = ballManager.resetBall();
    
  } else if (newBallX >= CANVAS_WIDTH - BALL_SIZE) {
    // newBallSpeed += 20; 
    leftScore++;
    // newPaddleSpeed += 6;
    newBallSpeed = 400; 
    [newBallX, newBallY, newBallSpeedX, newBallSpeedY] = ballManager.resetBall();
  }

  let winner = null;
  if (leftScore == 7) {
    winner = "Player 1";
  } else if (rightScore == 7) {
    winner = "Player 2";
  }
  
  return {
    ...state,
    leftPaddleY: newLeftPaddleY,
    rightPaddleY: newRightPaddleY,
    ballX: newBallX,
    ballY: newBallY,
    ballSpeedX: newBallSpeedX,
    ballSpeedY: newBallSpeedY,
    ball_speed: newBallSpeed,
    paddle_speed: newPaddleSpeed, 
    leftScore,
    rightScore,
    winner,
  };
};