import { GAME_CONSTANTS } from './gameConstants';

export const checkWallCollision = (y: number) => {
  return y <= 0 || y >= GAME_CONSTANTS.BOARD_HEIGHT - GAME_CONSTANTS.BALL_SIZE;
};

export const checkPaddleCollision = (ballPos : any, paddle1Pos : any, paddle2Pos : any) => {
  const ballLeft = ballPos.x <= GAME_CONSTANTS.PADDLE_WIDTH + 30 &&
    ballPos.y >= paddle1Pos &&
    ballPos.y <= paddle1Pos + GAME_CONSTANTS.PADDLE_HEIGHT;

  const ballRight = ballPos.x >= GAME_CONSTANTS.BOARD_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - 30 &&
    ballPos.y >= paddle2Pos &&
    ballPos.y <= paddle2Pos + GAME_CONSTANTS.PADDLE_HEIGHT;

  return { ballLeft, ballRight };
};