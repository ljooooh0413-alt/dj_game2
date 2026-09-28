import React from 'react';
import { RotateCcw, Trophy, Award, Layers, Palette } from 'lucide-react';
import { GameStats } from '../types/tetris';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenSkins?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onOpenSkins }) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-red-950/60 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        <h2 className="text-3xl font-black font-mono tracking-wider text-red-500 mb-1 drop-shadow-md">
          GAME OVER
        </h2>
        <p className="text-xs text-zinc-400 font-mono mb-4">
          블록이 상단 천장에 도달했습니다!
        </p>

        {isNewHighScore && (
          <div className="mb-4 py-2 px-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-center gap-2 text-amber-300 animate-pulse">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-wide">
              🎉 새로운 최고 기록 달성!
            </span>
          </div>
        )}

        <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 mb-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono text-zinc-400">최종 점수</span>
            <span className="text-2xl font-mono font-black text-white tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              도달 속도 레벨
            </span>
            <span className="font-bold text-amber-300">Lv {stats.level}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              지운 라인 수
            </span>
            <span className="font-bold text-emerald-300">{stats.lines} 라인</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
            <span className="text-zinc-400">총 설치한 블록</span>
            <span className="font-bold text-indigo-300">{stats.piecesPlaced} 개</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 active:scale-95 text-white font-mono font-bold rounded-xl shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 시작하기 (Space / Enter)</span>
          </button>

          {onOpenSkins && (
            <button
              type="button"
              onClick={onOpenSkins}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span>블록 스킨 보관함 열기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
