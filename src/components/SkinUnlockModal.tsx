import React, { useEffect, useRef } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { BlockSkin, TetrominoType } from '../types/tetris';
import { drawBevelBlock } from '../utils/renderBevelBlock';

interface SkinUnlockModalProps {
  skin: BlockSkin | null;
  onEquip: (id: string) => void;
  onDismiss: () => void;
}

export const SkinUnlockModal: React.FC<SkinUnlockModalProps> = ({
  skin,
  onEquip,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!skin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = 18;
    const pieces: { type: TetrominoType; x: number; y: number }[] = [
      { type: 'T', x: 20, y: 15 },
      { type: 'I', x: 95, y: 24 },
      { type: 'O', x: 190, y: 15 },
      { type: 'L', x: 245, y: 15 },
    ];

    // T piece
    drawBevelBlock(ctx, pieces[0].x + size, pieces[0].y, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[0].x, pieces[0].y + size, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[0].x + size, pieces[0].y + size, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[0].x + size * 2, pieces[0].y + size, size, 'T', false, skin.palette);

    // I piece
    for (let i = 0; i < 4; i++) {
      drawBevelBlock(ctx, pieces[1].x + i * size, pieces[1].y, size, 'I', false, skin.palette);
    }

    // O piece
    drawBevelBlock(ctx, pieces[2].x, pieces[2].y, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x + size, pieces[2].y, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x, pieces[2].y + size, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x + size, pieces[2].y + size, size, 'O', false, skin.palette);

    // L piece
    drawBevelBlock(ctx, pieces[3].x, pieces[3].y, size, 'L', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x, pieces[3].y + size, size, 'L', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x + size, pieces[3].y + size, size, 'L', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x + size * 2, pieces[3].y + size, size, 'L', false, skin.palette);
  }, [skin]);

  if (!skin) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
      <div className="relative bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-400/80 rounded-2xl max-w-sm w-full p-6 text-center font-mono shadow-2xl shadow-amber-500/20">
        {/* Celebration Badge Icon */}
        <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3 animate-bounce">
          <Sparkles className="w-8 h-8 text-black fill-current" />
        </div>

        <span className="inline-block text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full mb-2">
          {skin.requiredScore.toLocaleString()}점 달성 보상
        </span>

        <h2 className="text-xl font-black text-white tracking-wide mb-1">
          새로운 스킨 해금!
        </h2>

        <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300 mb-2">
          {skin.name}
        </p>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed px-2">
          {skin.description}
        </p>

        {/* Live Canvas Preview */}
        <div className="mb-5 flex justify-center">
          <canvas
            ref={canvasRef}
            width={310}
            height={60}
            className="w-full max-w-[310px] h-[60px] rounded-lg bg-black border border-zinc-700/80 shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onEquip(skin.id);
              onDismiss();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>지금 바로 장착하기</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 px-4 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            나중에 선택하기
          </button>
        </div>
      </div>
    </div>
  );
};
