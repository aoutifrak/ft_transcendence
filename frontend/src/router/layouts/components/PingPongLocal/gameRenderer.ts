import { CANVAS_WIDTH, CANVAS_HEIGHT } from './gameTypes';

export const drawGame = (ctx: CanvasRenderingContext2D, gameState: any) => {

  ctx.fillStyle = '#7C5577';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.shadowBlur = 5;
  
  const paddleGradient = ctx.createLinearGradient(0, 0, 20, 0);
  paddleGradient.addColorStop(0, '#ffffff');
  paddleGradient.addColorStop(1, '#ffffff');
  
  
  drawRoundedRect(ctx, 0, gameState.leftPaddleY, 10, 100, 5, paddleGradient);
  
  drawRoundedRect(ctx, CANVAS_WIDTH - 10, gameState.rightPaddleY, 10, 100, 5, paddleGradient);
  
  ctx.strokeStyle = 'rgba(27, 8, 73, 0.71)';
  ctx.shadowColor = 'rgba(121, 0, 0, 0.25)';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 8;
  const margin = 5;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, margin);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - margin);
  ctx.stroke();  

  ctx.beginPath();
  ctx.arc(gameState.ballX + 5, gameState.ballY + 5, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 15;
  ctx.fill();
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
};