import React, { useEffect, useRef } from 'react';
import { TETROMINO_SHAPES } from '../constants/tetris';
import { SkinPalette, TetrominoType } from '../types/tetris';
import { drawBevelBlock } from '../utils/renderBevelBlock';

interface PiecePreviewProps {
  type: TetrominoType | null;
  label?: string;
  size?: number;
  disabled?: boolean;
  palette?: SkinPalette;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  label,
  size = 20,
  disabled = false,
  palette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If disabled (e.g. hold already used this turn), dim it
    if (disabled) {
      ctx.globalAlpha = 0.4;
    } else {
      ctx.globalAlpha = 1.0;
    }

    if (!type) return;

    const shape = TETROMINO_SHAPES[type];
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    // Find actual bounds of filled blocks within the matrix
    let minR = shapeRows,
      maxR = -1,
      minC = shapeCols,
      maxC = -1;
    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (shape[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    const pieceWidth = (maxC - minC + 1) * size;
    const pieceHeight = (maxR - minR + 1) * size;

    const startX = Math.round((canvas.width - pieceWidth) / 2);
    const startY = Math.round((canvas.height - pieceHeight) / 2);

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (shape[r][c]) {
          const drawX = startX + (c - minC) * size;
          const drawY = startY + (r - minR) * size;
          drawBevelBlock(ctx, drawX, drawY, size, type, false, palette);
        }
      }
    }
  }, [type, size, disabled, palette]);

  return (
    <div className="flex flex-col items-center bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2.5 shadow-lg backdrop-blur-sm">
      {label && (
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
          {label}
        </span>
      )}
      <div className="relative flex items-center justify-center w-20 h-20 bg-black/80 rounded border border-zinc-800">
        <canvas
          ref={canvasRef}
          width={80}
          height={80}
          className="block"
        />
        {!type && (
          <div className="absolute text-zinc-600 font-mono text-xs select-none">
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
};
