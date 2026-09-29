import React from 'react';
import { Trophy, Zap, Layers, Gauge, Box, Palette } from 'lucide-react';
import { BLOCKS_PER_SPEED_LEVEL, getDropSpeed } from '../constants/tetris';
import { GameStats } from '../types/tetris';

interface StatsPanelProps {
  stats: GameStats;
  activeSkinName?: string;
  onOpenSkins?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, activeSkinName, onOpenSkins }) => {
  const blocksToNextSpeed = BLOCKS_PER_SPEED_LEVEL - (stats.piecesPlaced % BLOCKS_PER_SPEED_LEVEL);
  const progressInTier = ((stats.piecesPlaced % BLOCKS_PER_SPEED_LEVEL) / BLOCKS_PER_SPEED_LEVEL) * 100;
  const currentSpeedMs = getDropSpeed(stats.level);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* High Score */}
      <div className="bg-zinc-900/90 border border-amber-500/30 rounded-lg p-2.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Top Score</span>
        </div>
        <span className="font-mono text-base font-black text-amber-300 tabular-nums">
          {stats.highScore.toLocaleString()}
        </span>
      </div>

      {/* Current Score */}
      <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Score</span>
        </div>
        <span className="font-mono text-lg font-black text-white tabular-nums">
          {stats.score.toLocaleString()}
        </span>
      </div>

      {/* Level & Lines side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2 shadow-md flex flex-col items-center">
          <div className="flex items-center gap-1 text-purple-400 mb-0.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Speed Lv</span>
          </div>
          <span className="font-mono text-base font-black text-amber-300 tabular-nums">
            Lv {stats.level}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 font-semibold tracking-tight">
            {currentSpeedMs}ms
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2 shadow-md flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Lines</span>
          </div>
          <span className="font-mono text-base font-black text-emerald-200 tabular-nums">
            {stats.lines}
          </span>
        </div>
      </div>

      {/* 10-Block Speed Meter */}
      <div className="bg-zinc-900/90 border border-indigo-500/30 rounded-lg p-2 shadow-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="flex items-center gap-1 text-indigo-300 font-bold">
            <Box className="w-3 h-3 text-indigo-400" />
            <span>설치 블록</span>
          </span>
          <span className="text-zinc-300 font-bold tabular-nums">
            {stats.piecesPlaced}개
          </span>
        </div>

        {/* Progress bar to next 10 milestone */}
        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(4, progressInTier)}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
          <span>다음 가속까지</span>
          <span className="text-amber-400 font-bold">{blocksToNextSpeed}개 남음</span>
        </div>
      </div>

      {/* Active Skin Button / Tag */}
      {activeSkinName && onOpenSkins && (
        <button
          type="button"
          onClick={onOpenSkins}
          className="w-full bg-zinc-900/90 hover:bg-zinc-800/90 border border-purple-500/30 hover:border-purple-500/60 rounded-lg p-2 shadow-md flex items-center justify-between text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">스킨</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-purple-300 truncate max-w-[100px]">
            {activeSkinName}
          </span>
        </button>
      )}
    </div>
  );
};
