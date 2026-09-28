import React from 'react';
import { Palette, Check, Lock, Sparkles, X, Trophy } from 'lucide-react';
import { BlockSkin, TetrominoType } from '../types/tetris';
import { drawBevelBlock } from '../utils/renderBevelBlock';

interface SkinSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  skins: BlockSkin[];
  unlockedSkinIds: string[];
  activeSkinId: string;
  onSelectSkin: (id: string) => void;
  currentScore: number;
  highScore: number;
}

// Mini canvas renderer for skin preview
const MiniSkinPreview: React.FC<{ skin: BlockSkin }> = ({ skin }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw dark background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = 11;
    const pieces: { type: TetrominoType; x: number; y: number }[] = [
      { type: 'I', x: 6, y: 14 },
      { type: 'T', x: 56, y: 8 },
      { type: 'O', x: 104, y: 8 },
      { type: 'S', x: 140, y: 8 },
    ];

    // Draw I piece (4 blocks horizontal)
    for (let i = 0; i < 4; i++) {
      drawBevelBlock(ctx, pieces[0].x + i * size, pieces[0].y, size, 'I', false, skin.palette);
    }
    // Draw T piece
    drawBevelBlock(ctx, pieces[1].x + size, pieces[1].y, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[1].x, pieces[1].y + size, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[1].x + size, pieces[1].y + size, size, 'T', false, skin.palette);
    drawBevelBlock(ctx, pieces[1].x + size * 2, pieces[1].y + size, size, 'T', false, skin.palette);
    // Draw O piece (2x2)
    drawBevelBlock(ctx, pieces[2].x, pieces[2].y, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x + size, pieces[2].y, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x, pieces[2].y + size, size, 'O', false, skin.palette);
    drawBevelBlock(ctx, pieces[2].x + size, pieces[2].y + size, size, 'O', false, skin.palette);
    // Draw S piece
    drawBevelBlock(ctx, pieces[3].x + size, pieces[3].y, size, 'S', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x + size * 2, pieces[3].y, size, 'S', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x, pieces[3].y + size, size, 'S', false, skin.palette);
    drawBevelBlock(ctx, pieces[3].x + size, pieces[3].y + size, size, 'S', false, skin.palette);
  }, [skin]);

  return (
    <canvas
      ref={canvasRef}
      width={190}
      height={36}
      className="w-full h-9 rounded bg-black/90 border border-zinc-800"
    />
  );
};

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({
  isOpen,
  onClose,
  skins,
  unlockedSkinIds,
  activeSkinId,
  onSelectSkin,
  currentScore,
  highScore,
}) => {
  if (!isOpen) return null;

  const maxScore = Math.max(currentScore, highScore);

  // Find next locked skin
  const nextLockedSkin = skins.find((s) => !unlockedSkinIds.includes(s.id));
  const pointsToNext = nextLockedSkin ? Math.max(0, nextLockedSkin.requiredScore - maxScore) : 0;
  const progressToNext = nextLockedSkin
    ? Math.min(100, Math.max(0, (maxScore / nextLockedSkin.requiredScore) * 100))
    : 100;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl text-white shadow-md shadow-purple-900/40">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wider text-white flex items-center gap-2">
                <span>블록 스킨 보관함</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {unlockedSkinIds.length} / {skins.length} 해금
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                10,000점 달성할 때마다 새로운 블록 스킨이 해금됩니다!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress to next skin banner */}
        <div className="px-5 py-3 bg-zinc-950/50 border-b border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>최고 달성 점수: <strong className="text-amber-300">{maxScore.toLocaleString()}점</strong></span>
            </span>
            {nextLockedSkin ? (
              <span className="text-[11px] text-zinc-400">
                다음 해금: <strong className="text-purple-300">{nextLockedSkin.name}</strong> ({pointsToNext.toLocaleString()}점 남음)
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                모든 스킨 해금 완료!
              </span>
            )}
          </div>
          {nextLockedSkin && (
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/60">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          )}
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {skins.map((skin) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isEquipped = activeSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`relative rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-zinc-800/90 border-purple-500/80 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/40'
                    : isUnlocked
                    ? 'bg-zinc-900/80 border-zinc-700/80 hover:border-zinc-600 hover:bg-zinc-850'
                    : 'bg-zinc-950/60 border-zinc-800/60 opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider bg-gradient-to-r text-white ${
                        isUnlocked
                          ? skin.tagColor
                          : 'from-zinc-700 to-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {skin.badge}
                    </span>
                    {isEquipped && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        장착 중
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-1.5">
                    {!isUnlocked && <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                    <span>{skin.name}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-2.5 leading-snug line-clamp-2">
                    {skin.description}
                  </p>

                  {/* Preview Canvas */}
                  <div className="mb-3">
                    <MiniSkinPreview skin={skin} />
                  </div>
                </div>

                {/* Equip / Lock Button */}
                <div>
                  {isUnlocked ? (
                    <button
                      type="button"
                      disabled={isEquipped}
                      onClick={() => onSelectSkin(skin.id)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-98'
                      }`}
                    >
                      {isEquipped ? '✓ 현재 장착 중' : '스킨 장착하기'}
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span>{skin.requiredScore.toLocaleString()}점 달성 시 해금</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
