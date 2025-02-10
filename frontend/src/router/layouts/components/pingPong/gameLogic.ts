import { GameState } from './gameTypes';

export const updateGameState = (state: GameState, _deltaTime: number): GameState => {
  const newLeftPaddleY = state.leftPaddleY;
  const newRightPaddleY = state.rightPaddleY;
  let newBallX = state.ballX;
  let newBallY = state.ballY;
  let username1 = state.username1;
  let username2 = state.username2;
  let newBallSpeedX = state.ballSpeedX;
  let newBallSpeedY = state.ballSpeedY;
  let leftScore = state.leftScore;
  let rightScore = state.rightScore;

  return {
    ...state,
    leftPaddleY: newLeftPaddleY,
    rightPaddleY: newRightPaddleY,
    ballX: newBallX,
    ballY: newBallY,
    ballSpeedX: newBallSpeedX,
    ballSpeedY: newBallSpeedY,
    leftScore,
    rightScore,
    username1,
    username2,
    };
  };
