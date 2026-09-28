import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ChevronsDown,
  RotateCcw,
  RotateCw,
  Archive,
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCw,
  onRotateCcw,
  onHold,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-sm mt-3 px-2 flex flex-col gap-2 select-none md:hidden">
      {/* Top action row: Hold, Hard Drop */}
      <div className="flex justify-between items-center px-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onHold}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-600 rounded-lg text-xs font-mono font-bold text-zinc-200 shadow transition-all disabled:opacity-40"
        >
          <Archive className="w-4 h-4 text-purple-400" />
          <span>HOLD</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onHardDrop}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-950/80 active:bg-red-900 active:scale-95 border border-red-700/80 rounded-lg text-xs font-mono font-bold text-red-200 shadow transition-all disabled:opacity-40"
        >
          <ChevronsDown className="w-4 h-4 text-red-400 animate-bounce" />
          <span>HARD DROP</span>
        </button>
      </div>

      {/* Main control pad */}
      <div className="grid grid-cols-2 gap-4 items-center bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl shadow-lg">
        {/* Left: Direction Pad */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={onMoveLeft}
              className="w-12 h-12 bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-600 rounded-lg flex items-center justify-center text-white shadow disabled:opacity-40"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onMoveRight}
              className="w-12 h-12 bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-600 rounded-lg flex items-center justify-center text-white shadow disabled:opacity-40"
              aria-label="Move Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onSoftDrop}
            className="w-26 h-10 bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-600 rounded-lg flex items-center justify-center gap-1 text-xs font-mono font-bold text-zinc-300 shadow disabled:opacity-40"
            aria-label="Soft Drop"
          >
            <ArrowDown className="w-4 h-4" />
            <span>DOWN</span>
          </button>
        </div>

        {/* Right: Rotations */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={onRotateCcw}
              className="w-12 h-12 bg-indigo-950/80 active:bg-indigo-900 active:scale-95 border border-indigo-700 rounded-lg flex flex-col items-center justify-center text-indigo-200 shadow disabled:opacity-40"
              aria-label="Rotate Counter-Clockwise"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px] font-mono mt-0.5">CCW</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onRotateCw}
              className="w-12 h-12 bg-indigo-600 active:bg-indigo-500 active:scale-95 border border-indigo-400 rounded-lg flex flex-col items-center justify-center text-white shadow-md shadow-indigo-900/40 disabled:opacity-40"
              aria-label="Rotate Clockwise"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5">CW</span>
            </button>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">회전 버튼</span>
        </div>
      </div>
    </div>
  );
};
