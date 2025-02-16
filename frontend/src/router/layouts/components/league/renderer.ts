// renderer.ts
import { PlayerState, BallState } from './types';

interface Dimensions {
  canvasWidth: number;
  canvasHeight: number;
  playerWidth: number;
  playerHeight: number;
}

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  dimensions: Dimensions,
  player1: PlayerState,
  player2: PlayerState,
  ball: BallState
) => {
  const { canvasWidth, canvasHeight } = dimensions;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#FFCC70";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw goals
  const goalHeightStart = canvasHeight / 2 - 50;
  const goalHeightEnd = canvasHeight / 2 + 50;
  const goalWidth = 10;

  ctx.fillStyle = "yellow";
  ctx.fillRect(0, goalHeightStart, goalWidth, goalHeightEnd - goalHeightStart);
  ctx.fillRect(
    canvasWidth - goalWidth,
    goalHeightStart,
    goalWidth,
    goalHeightEnd - goalHeightStart
  );

  // Draw players
  drawPlayer(ctx, player1, dimensions, "#4158D0");
  drawPlayer(ctx, player2, dimensions, "#00f");

  // Draw ball
  drawBall(ctx, ball);
};

const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  dimensions: Dimensions,
  color: string
) => {
  const { playerWidth, playerHeight } = dimensions;
  
  ctx.save();
  ctx.translate(player.x + playerWidth / 2, player.y + playerHeight / 2);
  ctx.rotate((player.angle * Math.PI) / 180);

  ctx.fillStyle = color;
  ctx.fillRect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);

  // Direction indicator
  ctx.beginPath();
  ctx.moveTo(playerWidth / 2, 0);
  ctx.lineTo(playerWidth / 2 + 10, -10);
  ctx.lineTo(playerWidth / 2 + 10, 10);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const drawBall = (ctx: CanvasRenderingContext2D, ball: BallState) => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
};