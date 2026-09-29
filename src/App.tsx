/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Gamepad2,
  Keyboard,
  Info,
  Palette,
  Sparkles,
} from 'lucide-react';
import { GameOverModal } from './components/GameOverModal';
import { ItemBar } from './components/ItemBar';
import { PiecePreview } from './components/PiecePreview';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { SkinUnlockModal } from './components/SkinUnlockModal';
import { StatsPanel } from './components/StatsPanel';
import { TetrisBoard } from './components/TetrisBoard';
import { TouchControls } from './components/TouchControls';
import { useSkins } from './hooks/useSkins';
import { useTetris } from './hooks/useTetris';
import { sound } from './utils/audio';

export default function App() {
  const {
    board,
    currentPiece,
    ghostY,
    holdPiece,
    canHold,
    nextQueue,
    status,
    stats,
    clearingRows,
    isLockPending,
    items,
    slowTimeRemaining,
    itemToast,
    useItem,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    rotateCw,
    rotateCcw,
    softDrop,
    hardDrop,
    hold,
  } = useTetris();

  const {
    allSkins,
    unlockedSkinIds,
    activeSkin,
    activeSkinId,
    newlyUnlockedSkin,
    equipSkin,
    dismissUnlock,
  } = useSkins(stats.score, stats.highScore);

  const [soundOn, setSoundOn] = useState(sound.isSoundOn());
  const [bgmOn, setBgmOn] = useState(sound.isBgmOn());
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [cellSize, setCellSize] = useState(25);

  // Dynamic cell sizing based on viewport height so the board never overflows
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // 22 cells vertically (20 play rows + 2 border rows)
      if (vh < 680 || vw < 400) {
        setCellSize(20);
      } else if (vh < 800) {
        setCellSize(23);
      } else {
        setCellSize(26);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundOn(newState);
  };

  const handleToggleBgm = () => {
    const newState = sound.toggleBgm();
    setBgmOn(newState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between px-2 py-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600/30 border border-purple-500/50 rounded-lg">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="font-mono text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
              RETRO TETRIS
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
              클래식 아케이드 10×20 블록 퍼즐
            </p>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Block Skin Store Button */}
          <button
            type="button"
            onClick={() => setShowSkinModal(true)}
            title="블록 스킨 보관함 (10,000점마다 해금)"
            className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border bg-gradient-to-r from-purple-950/70 to-pink-950/70 border-purple-500/60 text-purple-200 hover:text-white hover:border-purple-400 transition-all cursor-pointer shadow-sm shadow-purple-950"
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline text-xs font-mono font-bold">스킨</span>
            <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-500/30">
              {unlockedSkinIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            title={soundOn ? '효과음 끄기' : '효과음 켜기'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundOn
                ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleBgm}
            title={bgmOn ? '8비트 BGM 끄기' : '8비트 BGM 켜기'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              bgmOn
                ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Music className={`w-4 h-4 ${bgmOn ? 'animate-pulse' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowControlsModal((v) => !v)}
            title="조작법 안내"
            className="p-2 rounded-lg border bg-zinc-800 border-zinc-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          {status === 'playing' ? (
            <button
              type="button"
              onClick={togglePause}
              title="일시정지 (P)"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-amber-950/60 border-amber-600/80 text-amber-200 hover:bg-amber-900/60 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PAUSE</span>
            </button>
          ) : status === 'paused' ? (
            <button
              type="button"
              onClick={togglePause}
              title="게임 재개 (P)"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-emerald-950/60 border-emerald-600/80 text-emerald-200 hover:bg-emerald-900/60 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RESUME</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startGame}
              title="게임 시작 (Space / Enter)"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-900/40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START</span>
            </button>
          )}

          {status !== 'idle' && (
            <button
              type="button"
              onClick={startGame}
              title="다시 시작"
              className="p-2 rounded-lg border bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
        <div className="flex flex-row items-start justify-center gap-3 sm:gap-5 w-full">
          {/* Left Column: HOLD & Desktop Shortcuts */}
          <aside className="hidden sm:flex flex-col gap-3 w-32 shrink-0">
            <PiecePreview
              type={holdPiece}
              label="HOLD"
              disabled={!canHold}
              size={20}
              palette={activeSkin.palette}
            />

            {/* Desktop Controls Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-zinc-400 font-mono text-[11px] shadow-md">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold mb-2 pb-1 border-b border-zinc-800">
                <Keyboard className="w-3.5 h-3.5 text-purple-400" />
                <span>조작 가이드</span>
              </div>
              <ul className="space-y-1.5">
                <li className="flex justify-between">
                  <span>← →</span>
                  <span className="text-zinc-200">좌우 이동</span>
                </li>
                <li className="flex justify-between">
                  <span>↓</span>
                  <span className="text-zinc-200">소프트드롭</span>
                </li>
                <li className="flex justify-between">
                  <span>Space</span>
                  <span className="text-red-300 font-bold">하드드롭</span>
                </li>
                <li className="flex justify-between">
                  <span>↑ / X</span>
                  <span className="text-zinc-200">시계 회전</span>
                </li>
                <li className="flex justify-between">
                  <span>Z</span>
                  <span className="text-zinc-200">반시계 회전</span>
                </li>
                <li className="flex justify-between">
                  <span>C / Shift</span>
                  <span className="text-purple-300">홀드</span>
                </li>
                <li className="flex justify-between">
                  <span>P / Esc</span>
                  <span className="text-amber-300">일시정지</span>
                </li>
                <li className="flex justify-between pt-1 border-t border-zinc-800/80">
                  <span className="text-cyan-400 font-bold">1 ~ 4</span>
                  <span className="text-cyan-300 font-bold">아이템 사용</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Center Column: The Authentic Beveled Tetris Board & Item Space */}
          <div className="relative flex flex-col items-center">
            {/* Mobile Top Sub-Bar (showing HOLD & Next on mobile) */}
            <div className="flex sm:hidden justify-between w-full max-w-[280px] mb-2 px-1">
              <div className="scale-85 origin-left">
                <PiecePreview
                  type={holdPiece}
                  label="HOLD"
                  disabled={!canHold}
                  size={16}
                  palette={activeSkin.palette}
                />
              </div>
              <div className="scale-85 origin-right">
                <PiecePreview
                  type={nextQueue.length > 0 ? nextQueue[0] : null}
                  label="NEXT"
                  size={16}
                  palette={activeSkin.palette}
                />
              </div>
            </div>

            <div className="relative">
              {/* Main Board Component */}
              <TetrisBoard
                board={board}
                currentPiece={currentPiece}
                ghostY={ghostY}
                clearingRows={clearingRows}
                cellSize={cellSize}
                isLockPending={isLockPending}
                palette={activeSkin.palette}
              />

              {/* Start Overlay (Idle) */}
              {status === 'idle' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-40">
                  <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-full mb-3 animate-pulse">
                    <Play className="w-8 h-8 text-purple-400 fill-current" />
                  </div>
                  <h2 className="font-mono text-xl font-bold tracking-wider text-white mb-2">
                    RETRO TETRIS
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 max-w-[200px] mb-5 leading-relaxed">
                    스페이스바 또는 시작 버튼을 눌러 게임을 시작하세요!
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-mono font-bold text-sm rounded-xl shadow-lg shadow-indigo-900/50 transition-all cursor-pointer"
                  >
                    게임 시작 (Space)
                  </button>
                </div>
              )}

              {/* Paused Overlay */}
              {status === 'paused' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-40">
                  <Pause className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                  <h3 className="font-mono text-2xl font-black text-amber-400 tracking-wider mb-2">
                    PAUSED
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mb-5">
                    P 키 또는 재개 버튼을 눌러 계속하세요
                  </p>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    계속하기 (Resume)
                  </button>
                </div>
              )}

              {/* Game Over Modal */}
              {status === 'gameover' && (
                <GameOverModal
                  stats={stats}
                  onRestart={startGame}
                  onOpenSkins={() => setShowSkinModal(true)}
                />
              )}
            </div>

            {/* Item Action Bar underneath the game board */}
            <ItemBar
              items={items}
              onUseItem={useItem}
              slowTimeRemaining={slowTimeRemaining}
              disabled={status !== 'playing'}
              itemToast={itemToast}
            />
          </div>

          {/* Right Column: NEXT Queue & Scoreboard */}
          <aside className="hidden sm:flex flex-col gap-3 w-36 shrink-0">
            {/* NEXT Queue (shows up to 3 next pieces) */}
            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2.5 shadow-lg flex flex-col items-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                NEXT
              </span>
              <div className="flex flex-col gap-1.5 w-full items-center">
                {nextQueue.slice(0, 3).map((type, idx) => (
                  <div key={idx} className={idx > 0 ? 'opacity-70 scale-90' : ''}>
                    <PiecePreview type={type} size={18} palette={activeSkin.palette} />
                  </div>
                ))}
              </div>
            </div>

            {/* Score & Level stats */}
            <StatsPanel
              stats={stats}
              activeSkinName={activeSkin.name}
              onOpenSkins={() => setShowSkinModal(true)}
            />
          </aside>
        </div>

        {/* Mobile Stats Bar & Touch Controls */}
        <div className="w-full flex flex-col items-center sm:hidden mt-2">
          <div className="w-full max-w-sm px-2">
            <StatsPanel
              stats={stats}
              activeSkinName={activeSkin.name}
              onOpenSkins={() => setShowSkinModal(true)}
            />
          </div>
          <TouchControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
            onRotateCw={rotateCw}
            onRotateCcw={rotateCcw}
            onHold={hold}
            disabled={status !== 'playing'}
          />
        </div>
      </main>

      {/* Controls Info Modal */}
      {showControlsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-purple-400" />
                조작법 및 게임 규칙
              </h3>
              <button
                type="button"
                onClick={() => setShowControlsModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-zinc-300">
              <div>
                <p className="font-bold text-purple-300 mb-1">키보드 조작:</p>
                <div className="space-y-1 text-zinc-400 pl-2">
                  <p>• <span className="text-zinc-200">← / →</span> : 좌우 이동</p>
                  <p>• <span className="text-zinc-200">↓ (아래)</span> : 소프트 드롭 (빠른 낙하)</p>
                  <p>• <span className="text-zinc-200">Space</span> : 하드 드롭 (즉시 바닥 설치)</p>
                  <p>• <span className="text-zinc-200">착지 딜레이</span> : 바닥이나 블록에 닿은 후 1초 동안 좌우 이동 및 회전으로 위치를 맞출 수 있으며, 1초가 지나면 자동으로 고정 설치됩니다.</p>
                  <p>• <span className="text-zinc-200">↑ (위) / X</span> : 시계 방향 90도 회전</p>
                  <p>• <span className="text-zinc-200">Z / Ctrl</span> : 반시계 방향 90도 회전</p>
                  <p>• <span className="text-zinc-200">C / Shift</span> : 홀드 (블록 보관)</p>
                  <p>• <span className="text-zinc-200">P / Esc</span> : 일시정지 / 계속하기</p>
                  <p>• <span className="text-cyan-400 font-bold">1 / 2 / 3 / 4</span> : 하단 아이템 슬롯 사용 (폭탄, 슬로우, I-블록, 드릴)</p>
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-2">
                <p className="font-bold text-cyan-300 mb-1">아이템 효과 (게임 화면 밑):</p>
                <div className="space-y-1 text-zinc-400 pl-2">
                  <p>• <span className="text-red-400 font-bold">[1] 💣 폭탄</span> : 하단에 쌓인 블록 2줄을 즉시 폭파하여 공간 확보</p>
                  <p>• <span className="text-cyan-400 font-bold">[2] ⏱️ 슬로우</span> : 10초간 낙하 속도를 대폭 감속시켜 위기 탈출</p>
                  <p>• <span className="text-indigo-400 font-bold">[3] 🟦 I-블록</span> : 현재 낙하 중인 블록을 일자 막대(I-미노)로 즉시 변환</p>
                  <p>• <span className="text-amber-400 font-bold">[4] 🧹 드릴</span> : 보드 밑바닥의 갇힌 구멍들을 메워 라인을 완성 및 정리</p>
                  <p>• <span className="text-emerald-300">※ 획득 방법</span> : 게임 시작 시 기본 2개 지급, <strong className="text-amber-300">점수 5,000점마다 랜덤 아이템 +1개 지급</strong>, 4줄 테트리스 및 6라인마다 추가 획득!</p>
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-2">
                <p className="font-bold text-emerald-300 mb-1">점수 규칙:</p>
                <div className="space-y-1 text-zinc-400 pl-2">
                  <p>• 1줄 제거: 100 × 레벨</p>
                  <p>• 2줄 제거: 300 × 레벨</p>
                  <p>• 3줄 제거: 500 × 레벨</p>
                  <p>• 4줄(테트리스): 800 × 레벨</p>
                  <p>• <span className="text-amber-300 font-bold">속도 가속 규칙</span>: 블록이 10개 설치될 때마다 속도 레벨(Speed Lv)이 오르고 블록 낙하 속도가 점점 빨라집니다!</p>
                  <p>• <span className="text-purple-300 font-bold">블록 스킨 보상</span>: 점수 10,000점마다 새로운 전용 블록 스킨이 해금됩니다!</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowControlsModal(false)}
              className="mt-5 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Block Skins Vault Modal */}
      <SkinSelectorModal
        isOpen={showSkinModal}
        onClose={() => setShowSkinModal(false)}
        skins={allSkins}
        unlockedSkinIds={unlockedSkinIds}
        activeSkinId={activeSkinId}
        onSelectSkin={equipSkin}
        currentScore={stats.score}
        highScore={stats.highScore}
      />

      {/* Celebratory In-Game Skin Unlock Fanfare Modal */}
      <SkinUnlockModal
        skin={newlyUnlockedSkin}
        onEquip={equipSkin}
        onDismiss={dismissUnlock}
      />

      {/* Footer */}
      <footer className="w-full text-center py-2 text-[10px] font-mono text-zinc-600">
        Authentic Retro Bevel Frame Engine • 7-Bag Randomizer & SRS Supported
      </footer>
    </div>
  );
}
