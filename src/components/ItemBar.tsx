import React from 'react';
import { Bomb, Clock, Wand2, Sparkles, Layers, Zap } from 'lucide-react';
import { ItemState, ItemType } from '../types/tetris';

interface ItemBarProps {
  items: ItemState;
  onUseItem: (type: ItemType) => void;
  slowTimeRemaining: number;
  disabled?: boolean;
  itemToast?: { message: string; color: string } | null;
}

interface ItemConfig {
  id: ItemType;
  keyLabel: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  activeColor: string;
  badgeBg: string;
  glowColor: string;
}

export const ItemBar: React.FC<ItemBarProps> = ({
  items,
  onUseItem,
  slowTimeRemaining,
  disabled = false,
  itemToast,
}) => {
  const itemConfigs: ItemConfig[] = [
    {
      id: 'bomb',
      keyLabel: '1',
      name: '폭탄',
      desc: '하단 2줄 폭파',
      icon: <Bomb className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />,
      activeColor: 'border-red-500/50 bg-gradient-to-b from-red-950/60 to-zinc-900/90 text-red-200',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      glowColor: 'shadow-red-950/40',
    },
    {
      id: 'slow',
      keyLabel: '2',
      name: '슬로우',
      desc: '10초 감속',
      icon: <Clock className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />,
      activeColor: 'border-cyan-500/50 bg-gradient-to-b from-cyan-950/60 to-zinc-900/90 text-cyan-200',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glowColor: 'shadow-cyan-950/40',
    },
    {
      id: 'morphI',
      keyLabel: '3',
      name: 'I-블록',
      desc: '일자 막대 변환',
      icon: <Wand2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />,
      activeColor: 'border-indigo-500/50 bg-gradient-to-b from-indigo-950/60 to-zinc-900/90 text-indigo-200',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      glowColor: 'shadow-indigo-950/40',
    },
    {
      id: 'drill',
      keyLabel: '4',
      name: '드릴',
      desc: '구멍 메움&정리',
      icon: <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />,
      activeColor: 'border-amber-500/50 bg-gradient-to-b from-amber-950/60 to-zinc-900/90 text-amber-200',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glowColor: 'shadow-amber-950/40',
    },
  ];

  return (
    <div className="w-full max-w-[280px] sm:max-w-[312px] flex flex-col gap-1 select-none font-mono mt-2">
      {/* Toast feedback banner */}
      {itemToast && (
        <div
          className={`text-center text-[11px] font-bold py-1 px-2 rounded-md bg-zinc-900/95 border border-zinc-700 shadow-md animate-in fade-in slide-in-from-top-1 ${itemToast.color}`}
        >
          {itemToast.message}
        </div>
      )}

      {/* Main Item Dock Container */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-2 shadow-2xl backdrop-blur-md">
        {/* Header line */}
        <div className="flex items-center justify-between px-1 mb-1.5 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-300">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>아이템 슬롯</span>
          </div>

          {slowTimeRemaining > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 animate-pulse">
              <Clock className="w-3 h-3 animate-spin" />
              <span>슬로우 {slowTimeRemaining}초</span>
            </span>
          ) : (
            <span className="text-[9px] text-zinc-500 hidden sm:inline">
              단축키 [1] ~ [4]
            </span>
          )}
        </div>

        {/* 4 Item Slots */}
        <div className="grid grid-cols-4 gap-1.5">
          {itemConfigs.map((cfg) => {
            const count = items[cfg.id];
            const isUsable = !disabled && count > 0;
            const isSlowActive = cfg.id === 'slow' && slowTimeRemaining > 0;

            return (
              <button
                key={cfg.id}
                type="button"
                disabled={!isUsable}
                onClick={() => onUseItem(cfg.id)}
                title={`${cfg.name} (${cfg.desc}) - 단축키 [${cfg.keyLabel}]`}
                className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                  isSlowActive
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-100 ring-2 ring-cyan-400/50 animate-pulse'
                    : isUsable
                    ? `${cfg.activeColor} hover:brightness-125 active:scale-95 shadow-md ${cfg.glowColor}`
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-600 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Keyboard Shortcut badge on desktop */}
                <span className="absolute -top-1.5 -left-1 hidden sm:flex items-center justify-center w-3.5 h-3.5 rounded bg-zinc-800 border border-zinc-600 text-[8px] font-bold text-zinc-300">
                  {cfg.keyLabel}
                </span>

                {/* Quantity badge */}
                <span
                  className={`absolute -top-1.5 -right-1 flex items-center justify-center px-1 h-3.5 min-w-3.5 rounded-full border text-[8px] font-bold ${
                    count > 0 ? cfg.badgeBg : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  x{count}
                </span>

                {/* Icon */}
                <div className="my-0.5">{cfg.icon}</div>

                {/* Name */}
                <span className="text-[10px] font-bold tracking-tight mt-0.5">
                  {cfg.name}
                </span>

                {/* Mini Description */}
                <span className="text-[8px] text-zinc-400 tracking-tighter truncate max-w-full">
                  {cfg.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
