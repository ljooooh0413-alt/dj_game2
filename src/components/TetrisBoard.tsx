import React, { useEffect, useRef } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants/tetris';
import { BoardMatrix, SkinPalette, TetrominoPiece } from '../types/tetris';
import { drawBevelBlock } from '../utils/renderBevelBlock';

interface TetrisBoardProps {
  board: BoardMatrix;
  currentPiece: TetrominoPiece | null;
  ghostY: number | null;
  clearingRows: number[];
  cellSize?: number;
  isLockPending?: boolean;
  palette?: SkinPalette;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  board,
  currentPiece,
  ghostY,
  clearingRows,
  cellSize = 26,
  isLockPending = false,
  palette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Total grid dimensions including the 1-block outer border ring
  const totalCols = BOARD_WIDTH + 2; // 12
  const totalRows = BOARD_HEIGHT + 2; // 22

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = totalCols * cellSize;
    const height = totalRows * cellSize;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw outer black background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw border blocks (Top row, Bottom row, Left col, Right col)
    for (let c = 0; c < totalCols; c++) {
      // Top border
      drawBevelBlock(ctx, c * cellSize, 0, cellSize, 'border', false, palette);
      // Bottom border
      drawBevelBlock(ctx, c * cellSize, (totalRows - 1) * cellSize, cellSize, 'border', false, palette);
    }
    for (let r = 1; r < totalRows - 1; r++) {
      // Left border
      drawBevelBlock(ctx, 0, r * cellSize, cellSize, 'border', false, palette);
      // Right border
      drawBevelBlock(ctx, (totalCols - 1) * cellSize, r * cellSize, cellSize, 'border', false, palette);
    }

    // 3. Draw internal playable area background (pure pitch black, matching screenshot)
    const playAreaX = cellSize;
    const playAreaY = cellSize;
    const playAreaWidth = BOARD_WIDTH * cellSize;
    const playAreaHeight = BOARD_HEIGHT * cellSize;

    ctx.fillStyle = '#000000';
    ctx.fillRect(playAreaX, playAreaY, playAreaWidth, playAreaHeight);

    // Subtle dark grid lines inside play area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let c = 1; c < BOARD_WIDTH; c++) {
      ctx.beginPath();
      ctx.moveTo(playAreaX + c * cellSize, playAreaY);
      ctx.lineTo(playAreaX + c * cellSize, playAreaY + playAreaHeight);
      ctx.stroke();
    }
    for (let r = 1; r < BOARD_HEIGHT; r++) {
      ctx.beginPath();
      ctx.moveTo(playAreaX, playAreaY + r * cellSize);
      ctx.lineTo(playAreaX + playAreaWidth, playAreaY + r * cellSize);
      ctx.stroke();
    }

    // 4. Draw placed blocks on the board
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      const isRowClearing = clearingRows.includes(r);
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cell = board[r][c];
        if (cell !== null) {
          const drawX = playAreaX + c * cellSize;
          const drawY = playAreaY + r * cellSize;
          drawBevelBlock(ctx, drawX, drawY, cellSize, cell, isRowClearing, palette);
        }
      }
    }

    // 5. Draw ghost piece (if piece is active)
    if (currentPiece && ghostY !== null && ghostY >= currentPiece.y) {
      const { shape, x: pieceX } = currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const targetY = ghostY + r;
            const targetX = pieceX + c;
            if (targetY >= 0 && targetY < BOARD_HEIGHT) {
              const drawX = playAreaX + targetX * cellSize;
              const drawY = playAreaY + targetY * cellSize;
              drawBevelBlock(ctx, drawX, drawY, cellSize, 'ghost', false, palette);
            }
          }
        }
      }
    }

    // 6. Draw active falling piece
    if (currentPiece) {
      const { shape, x: pieceX, y: pieceY, type } = currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const targetY = pieceY + r;
            const targetX = pieceX + c;
            if (targetY >= 0 && targetY < BOARD_HEIGHT) {
              const drawX = playAreaX + targetX * cellSize;
              const drawY = playAreaY + targetY * cellSize;
              drawBevelBlock(ctx, drawX, drawY, cellSize, type, false, palette);

              // If waiting on 1-second lock delay, draw a subtle white highlight rim
              if (isLockPending) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(drawX + 1.5, drawY + 1.5, cellSize - 3, cellSize - 3);
              }
            }
          }
        }
      }
    }

    ctx.restore();
  }, [board, currentPiece, ghostY, clearingRows, cellSize, isLockPending, palette]);

  return (
    <div className="relative inline-block select-none shadow-2xl rounded-sm overflow-hidden border border-zinc-700/80 bg-black">
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          width: `${totalCols * cellSize}px`,
          height: `${totalRows * cellSize}px`,
        }}
      />
    </div>
  );
};
