import { BLOCK_COLORS } from '../constants/tetris';
import { TetrominoType, SkinPalette } from '../types/tetris';

export function drawBevelBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TetrominoType | 'border' | 'ghost',
  isClearing = false,
  customPalette?: SkinPalette
) {
  if (isClearing) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    return;
  }

  const palette = customPalette ? customPalette[type] : BLOCK_COLORS[type];
  const bevel = Math.max(2, Math.floor(size * 0.14));

  if (type === 'ghost') {
    // Translucent outline for ghost piece
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);

    // Inner subtle cross or corners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + size - 5, y + 3, 2, 2);
    ctx.fillRect(x + 3, y + size - 5, 2, 2);
    ctx.fillRect(x + size - 5, y + size - 5, 2, 2);
    return;
  }

  // Base fill
  ctx.fillStyle = palette.base;
  ctx.fillRect(x, y, size, size);

  // Top Bevel (Lightest)
  ctx.fillStyle = palette.light;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size - bevel, y + bevel);
  ctx.lineTo(x + bevel, y + bevel);
  ctx.closePath();
  ctx.fill();

  // Left Bevel (Light)
  ctx.fillStyle = palette.light;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + bevel, y + bevel);
  ctx.lineTo(x + bevel, y + size - bevel);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();

  // Right Bevel (Dark)
  ctx.fillStyle = palette.dark;
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size - bevel, y + size - bevel);
  ctx.lineTo(x + size - bevel, y + bevel);
  ctx.closePath();
  ctx.fill();

  // Bottom Bevel (Darkest)
  ctx.fillStyle = palette.border;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + bevel, y + size - bevel);
  ctx.lineTo(x + size - bevel, y + size - bevel);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();

  // Thin outer seam for crisp retro arcade block separation
  ctx.strokeStyle = type === 'border' ? '#18181b' : 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}
