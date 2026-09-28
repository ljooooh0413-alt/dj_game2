import { useCallback, useEffect, useRef, useState } from 'react';
import { BLOCKS_PER_SPEED_LEVEL, BOARD_HEIGHT, BOARD_WIDTH, POINTS, getDropSpeed } from '../constants/tetris';
import { CellValue, GameStats, GameStatus, ItemState, ItemType, TetrominoPiece, TetrominoType } from '../types/tetris';
import { sound } from '../utils/audio';

const INITIAL_ITEMS: ItemState = {
  bomb: 2,
  slow: 2,
  morphI: 2,
  drill: 2,
};
import {
  checkCollision,
  checkFullLines,
  clearCompletedLines,
  createEmptyBoard,
  createPiece,
  generate7Bag,
  getGhostY,
  mergePieceToBoard,
  tryRotatePiece,
} from '../utils/tetrisEngine';

const HIGH_SCORE_KEY = 'retro_tetris_high_score';

export function useTetris() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<TetrominoPiece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [bag, setBag] = useState<TetrominoType[]>([]);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [stats, setStats] = useState<GameStats>(() => {
    const savedHighScore = typeof window !== 'undefined' ? localStorage.getItem(HIGH_SCORE_KEY) : null;
    return {
      score: 0,
      lines: 0,
      level: 1,
      piecesPlaced: 0,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) || 0 : 0,
    };
  });
  const [isLockPending, setIsLockPending] = useState(false);
  const lockTimerRef = useRef<number | null>(null);

  const [items, setItems] = useState<ItemState>(INITIAL_ITEMS);
  const [slowTimeRemaining, setSlowTimeRemaining] = useState<number>(0);
  const [itemToast, setItemToast] = useState<{ message: string; color: string } | null>(null);
  const itemToastTimerRef = useRef<number | null>(null);

  const showItemToast = useCallback((message: string, color = 'text-amber-300') => {
    if (itemToastTimerRef.current !== null) {
      window.clearTimeout(itemToastTimerRef.current);
    }
    setItemToast({ message, color });
    itemToastTimerRef.current = window.setTimeout(() => {
      setItemToast(null);
    }, 2200);
  }, []);

  const grantItem = useCallback((type: ItemType, toastMsg?: string) => {
    setItems((prev) => {
      if (prev[type] >= 5) return prev;
      return { ...prev, [type]: prev[type] + 1 };
    });
    sound.playItemGain();
    if (toastMsg) {
      showItemToast(toastMsg, 'text-emerald-300');
    }
  }, [showItemToast]);

  // Keep references for animation frame / interval access
  const stateRef = useRef({
    board,
    currentPiece,
    holdPiece,
    canHold,
    nextQueue,
    bag,
    status,
    stats,
    clearingRows,
    items,
  });

  stateRef.current = {
    board,
    currentPiece,
    holdPiece,
    canHold,
    nextQueue,
    bag,
    status,
    stats,
    clearingRows,
    items,
  };

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setIsLockPending(false);
  }, []);

  // Pull piece from 7-bag
  const pullNextPiece = useCallback((): { piece: TetrominoType; newBag: TetrominoType[]; newQueue: TetrominoType[] } => {
    let currentBag = [...stateRef.current.bag];
    let queue = [...stateRef.current.nextQueue];

    while (queue.length < 4) {
      if (currentBag.length === 0) {
        currentBag = generate7Bag();
      }
      queue.push(currentBag.shift()!);
    }

    const nextType = queue.shift()!;
    return {
      piece: nextType,
      newBag: currentBag,
      newQueue: queue,
    };
  }, []);

  // Spawn a new piece
  const spawnPiece = useCallback((targetType?: TetrominoType) => {
    const { board } = stateRef.current;
    let nextType = targetType;

    if (!nextType) {
      const pulled = pullNextPiece();
      nextType = pulled.piece;
      setBag(pulled.newBag);
      setNextQueue(pulled.newQueue);
    }

    const newPiece = createPiece(nextType);

    // Check if new piece immediately collides => Game Over
    if (checkCollision(board, newPiece.shape, newPiece.x, newPiece.y)) {
      setStatus('gameover');
      sound.playGameOver();
      return;
    }

    setCurrentPiece(newPiece);
    setCanHold(true);
  }, [pullNextPiece]);

  // Lock current piece to board
  const lockPiece = useCallback((pieceToLock: TetrominoPiece) => {
    clearLockTimer();
    const { board, stats } = stateRef.current;
    const newBoard = mergePieceToBoard(board, pieceToLock);
    sound.playDrop();

    const nextPiecesPlaced = stats.piecesPlaced + 1;
    const nextLevel = Math.floor(nextPiecesPlaced / BLOCKS_PER_SPEED_LEVEL) + 1;

    // Play level up chime when 15-block milestone is achieved
    if (nextLevel > stats.level) {
      sound.playLevelUp();
    }

    // Check for full lines
    const fullLines = checkFullLines(newBoard);

    if (fullLines.length > 0) {
      // Trigger flash animation
      setClearingRows(fullLines);

      if (fullLines.length === 4) {
        sound.playTetrisClear();
        grantItem('bomb', '✨ 4줄 테트리스! 폭탄 +1 획득!');
      } else {
        sound.playLineClear();
      }

      setTimeout(() => {
        const clearedBoard = clearCompletedLines(newBoard, fullLines);
        setBoard(clearedBoard);
        setClearingRows([]);

        // Score calculation
        let earnedScore = 0;
        if (fullLines.length === 1) earnedScore = POINTS.SINGLE * nextLevel;
        else if (fullLines.length === 2) earnedScore = POINTS.DOUBLE * nextLevel;
        else if (fullLines.length === 3) earnedScore = POINTS.TRIPLE * nextLevel;
        else if (fullLines.length === 4) earnedScore = POINTS.TETRIS * nextLevel;

        const newLines = stats.lines + fullLines.length;

        // Line milestone item bonus (every 6 lines)
        if (fullLines.length !== 4 && Math.floor(newLines / 6) > Math.floor(stats.lines / 6)) {
          const itemTypes: ItemType[] = ['bomb', 'slow', 'morphI', 'drill'];
          const picked = itemTypes[Math.floor(Math.random() * itemTypes.length)];
          const names: Record<ItemType, string> = { bomb: '폭탄', slow: '슬로우', morphI: 'I-블록', drill: '드릴' };
          grantItem(picked, `🎁 라인 돌파 보너스! ${names[picked]} +1 획득!`);
        }

        const newScore = stats.score + earnedScore;
        const newHighScore = Math.max(stats.highScore, newScore);

        if (newHighScore > stats.highScore) {
          try {
            localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
          } catch {
            // LocalStorage fallback
          }
        }

        setStats({
          score: newScore,
          lines: newLines,
          level: nextLevel,
          piecesPlaced: nextPiecesPlaced,
          highScore: newHighScore,
        });

        // Spawn next piece
        spawnPiece();
      }, 150);
    } else {
      setBoard(newBoard);
      setStats((prev) => ({
        ...prev,
        piecesPlaced: nextPiecesPlaced,
        level: nextLevel,
      }));
      spawnPiece();
    }
  }, [clearLockTimer, spawnPiece]);

  // Lock delay: 1000ms (1 second) before placing block if not hard-dropped
  const scheduleLockTimer = useCallback(() => {
    // If a lock countdown is already ticking for current contact, do not reset it
    if (lockTimerRef.current !== null) {
      return;
    }
    setIsLockPending(true);
    lockTimerRef.current = window.setTimeout(() => {
      const { board, currentPiece, status } = stateRef.current;
      if (status !== 'playing' || !currentPiece) {
        clearLockTimer();
        return;
      }
      // Verify piece is still resting on ground or stacked blocks
      if (checkCollision(board, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
        clearLockTimer();
        lockPiece(currentPiece);
      } else {
        clearLockTimer();
      }
    }, 1000);
  }, [clearLockTimer, lockPiece]);

  // Move active piece horizontally - allowed during the 1-second lock delay window
  const moveHorizontal = useCallback((dir: number) => {
    const { board, currentPiece, status, clearingRows } = stateRef.current;
    if (status !== 'playing' || !currentPiece || clearingRows.length > 0) return;

    if (!checkCollision(board, currentPiece.shape, currentPiece.x + dir, currentPiece.y)) {
      const nextPiece = {
        ...currentPiece,
        x: currentPiece.x + dir,
      };
      setCurrentPiece(nextPiece);
      sound.playMove();

      // If resting on ground after moving, schedule 1-second lock delay (if not already running)
      if (checkCollision(board, nextPiece.shape, nextPiece.x, nextPiece.y + 1)) {
        scheduleLockTimer();
      } else {
        // Moved off an edge into open air -> cancel lock delay
        clearLockTimer();
      }
    }
  }, [scheduleLockTimer, clearLockTimer]);

  // Rotate active piece - allowed during the 1-second lock delay window
  const rotate = useCallback((clockwise = true) => {
    const { board, currentPiece, status, clearingRows } = stateRef.current;
    if (status !== 'playing' || !currentPiece || clearingRows.length > 0) return;

    const rotated = tryRotatePiece(board, currentPiece, clockwise);
    if (rotated) {
      setCurrentPiece(rotated);
      sound.playRotate();

      // If resting on ground after rotation, schedule 1-second lock delay (if not already running)
      if (checkCollision(board, rotated.shape, rotated.x, rotated.y + 1)) {
        scheduleLockTimer();
      } else {
        clearLockTimer();
      }
    }
  }, [scheduleLockTimer, clearLockTimer]);

  // Soft drop (down 1 cell) - does NOT lock immediately; waits 1 second if on ground
  const softDrop = useCallback(() => {
    const { board, currentPiece, status, clearingRows } = stateRef.current;
    if (status !== 'playing' || !currentPiece || clearingRows.length > 0) return;

    if (!checkCollision(board, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      const nextPiece = {
        ...currentPiece,
        y: currentPiece.y + 1,
      };
      setCurrentPiece(nextPiece);
      setStats((prev) => ({ ...prev, score: prev.score + POINTS.SOFT_DROP }));

      // If it lands on the floor/block, start 1-second timer
      if (checkCollision(board, nextPiece.shape, nextPiece.x, nextPiece.y + 1)) {
        scheduleLockTimer();
      } else {
        clearLockTimer();
      }
    } else {
      // Already on the ground: start 1-second lock timer if not already ticking
      scheduleLockTimer();
    }
  }, [scheduleLockTimer, clearLockTimer]);

  // Hard drop (Spacebar: immediately drop to bottom and lock without 1-second delay)
  const hardDrop = useCallback(() => {
    const { board, currentPiece, status, clearingRows } = stateRef.current;
    if (status !== 'playing' || !currentPiece || clearingRows.length > 0) return;

    // Cancel lock timer: hard drop installs immediately
    clearLockTimer();

    const ghostY = getGhostY(board, currentPiece);
    const dropDistance = ghostY - currentPiece.y;

    const lockedPiece = {
      ...currentPiece,
      y: ghostY,
    };

    setStats((prev) => ({
      ...prev,
      score: prev.score + dropDistance * POINTS.HARD_DROP,
    }));

    sound.playHardDrop();
    setCurrentPiece(null);
    lockPiece(lockedPiece);
  }, [clearLockTimer, lockPiece]);

  // Hold piece
  const hold = useCallback(() => {
    const { board, currentPiece, holdPiece, canHold, status, clearingRows } = stateRef.current;
    if (status !== 'playing' || !currentPiece || !canHold || clearingRows.length > 0) return;

    // Disallow hold if the block has already touched down
    if (checkCollision(board, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      return;
    }

    clearLockTimer();
    sound.playHold();
    const currentType = currentPiece.type;

    if (holdPiece === null) {
      setHoldPiece(currentType);
      spawnPiece();
    } else {
      setHoldPiece(currentType);
      spawnPiece(holdPiece);
    }
    setCanHold(false);
  }, [clearLockTimer, spawnPiece]);

  // Use an Item
  const useItem = useCallback((type: ItemType) => {
    const { status, clearingRows, currentPiece, board } = stateRef.current;
    if (status !== 'playing' || clearingRows.length > 0) return;
    if (items[type] <= 0) return;

    if (type === 'bomb') {
      // Collect up to 2 bottom-most rows that have blocks
      const rowsToClear: number[] = [];
      for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
        if (board[r].some((c) => c !== null)) {
          rowsToClear.push(r);
          if (rowsToClear.length === 2) break;
        }
      }

      if (rowsToClear.length === 0) {
        showItemToast('⚠️ 파괴할 블록이 없습니다!', 'text-yellow-400');
        return;
      }

      const remainingRows = board.filter((_, idx) => !rowsToClear.includes(idx));
      const emptyRows = Array.from({ length: rowsToClear.length }, () =>
        Array<CellValue>(BOARD_WIDTH).fill(null)
      );
      const newBoard = [...emptyRows, ...remainingRows];

      setBoard(newBoard);
      setItems((prev) => ({ ...prev, bomb: prev.bomb - 1 }));
      sound.playBomb();
      showItemToast(`💣 하단 ${rowsToClear.length}줄 폭파 완료!`, 'text-red-400');

      if (currentPiece && checkCollision(newBoard, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
        scheduleLockTimer();
      } else {
        clearLockTimer();
      }
    } else if (type === 'slow') {
      setItems((prev) => ({ ...prev, slow: prev.slow - 1 }));
      setSlowTimeRemaining(10);
      sound.playSlow();
      showItemToast('⏱️ 10초간 슬로우 모드 가동!', 'text-cyan-400');
    } else if (type === 'morphI') {
      if (!currentPiece) return;
      const iPiece = createPiece('I');
      let targetX = Math.max(0, Math.min(BOARD_WIDTH - 4, currentPiece.x));
      let targetY = currentPiece.y;
      while (targetY > 0 && checkCollision(board, iPiece.shape, targetX, targetY)) {
        targetY--;
      }
      const newPiece: TetrominoPiece = {
        type: 'I',
        shape: iPiece.shape,
        x: targetX,
        y: targetY,
        rotation: 0,
      };
      setCurrentPiece(newPiece);
      clearLockTimer();
      setItems((prev) => ({ ...prev, morphI: prev.morphI - 1 }));
      sound.playMorph();
      showItemToast('🟦 I-미노(일자 막대)로 변환 완료!', 'text-indigo-300');
    } else if (type === 'drill') {
      // Fill trapped holes below blocks across all columns
      const newBoard = board.map((row) => [...row]);

      for (let c = 0; c < BOARD_WIDTH; c++) {
        let seenBlockAbove = false;
        for (let r = 0; r < BOARD_HEIGHT; r++) {
          if (newBoard[r][c] !== null) {
            seenBlockAbove = true;
          } else if (seenBlockAbove && newBoard[r][c] === null) {
            newBoard[r][c] = 'O';
          }
        }
      }

      const fullLines = checkFullLines(newBoard);
      if (fullLines.length > 0) {
        setBoard(newBoard);
        setClearingRows(fullLines);
        sound.playLineClear();
        setTimeout(() => {
          const cleared = clearCompletedLines(newBoard, fullLines);
          setBoard(cleared);
          setClearingRows([]);
          setStats((prev) => ({
            ...prev,
            lines: prev.lines + fullLines.length,
            score: prev.score + fullLines.length * 300,
          }));
        }, 150);
      } else {
        // If no holes, clean bottom-most row
        let lowestRow = -1;
        for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
          if (newBoard[r].some((c) => c !== null)) {
            lowestRow = r;
            break;
          }
        }
        if (lowestRow !== -1) {
          newBoard.splice(lowestRow, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }
        setBoard(newBoard);
      }

      setItems((prev) => ({ ...prev, drill: prev.drill - 1 }));
      sound.playDrill();
      showItemToast('🧹 바닥 정리 & 구멍 메우기 드릴 발동!', 'text-amber-400');
    }
  }, [items, clearLockTimer, scheduleLockTimer, showItemToast]);

  // Slow timer 1-second countdown effect
  useEffect(() => {
    if (slowTimeRemaining <= 0 || status !== 'playing') return;
    const timer = setInterval(() => {
      setSlowTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [slowTimeRemaining, status]);

  // Start new game
  const startGame = useCallback(() => {
    clearLockTimer();
    const freshBoard = createEmptyBoard();
    const initialBag = generate7Bag();
    const queue = initialBag.splice(0, 4);

    setBoard(freshBoard);
    setHoldPiece(null);
    setCanHold(true);
    setClearingRows([]);
    setBag(initialBag);
    setNextQueue(queue);
    setItems(INITIAL_ITEMS);
    setSlowTimeRemaining(0);
    setItemToast(null);

    const firstPieceType = queue.shift()!;
    // Refill queue if needed
    if (queue.length < 3) {
      queue.push(initialBag.shift() || generate7Bag()[0]);
    }
    setNextQueue(queue);

    const firstPiece = createPiece(firstPieceType);
    setCurrentPiece(firstPiece);

    setStats((prev) => ({
      score: 0,
      lines: 0,
      level: 1,
      piecesPlaced: 0,
      highScore: prev.highScore,
    }));

    setStatus('playing');
  }, [clearLockTimer]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'playing') {
        clearLockTimer();
        return 'paused';
      }
      if (prev === 'paused') return 'playing';
      return prev;
    });
  }, [clearLockTimer]);

  // Game Loop Timer for automatic dropping
  useEffect(() => {
    if (status !== 'playing' || clearingRows.length > 0) return;

    const baseInterval = getDropSpeed(stats.level);
    // If slow time is active, cap speed at comfortable 850ms
    const interval = slowTimeRemaining > 0 ? 850 : baseInterval;

    const timer = setInterval(() => {
      const { board, currentPiece } = stateRef.current;
      if (!currentPiece) return;

      if (!checkCollision(board, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
        const nextY = currentPiece.y + 1;
        setCurrentPiece((prev) => (prev ? { ...prev, y: nextY } : null));

        // When block touches ground after this drop step, start 1-second lock delay
        if (checkCollision(board, currentPiece.shape, currentPiece.x, nextY + 1)) {
          scheduleLockTimer();
        } else {
          clearLockTimer();
        }
      } else {
        // Block is already resting on ground/block; ensure 1-second delay is active
        if (lockTimerRef.current === null) {
          scheduleLockTimer();
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [status, stats.level, slowTimeRemaining, clearingRows.length, scheduleLockTimer, clearLockTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLockTimer();
    };
  }, [clearLockTimer]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
      }

      if (stateRef.current.status !== 'playing') {
        if (e.key === 'Enter' || e.key === ' ') {
          if (stateRef.current.status === 'idle' || stateRef.current.status === 'gameover') {
            startGame();
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          softDrop();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          rotate(true);
          break;
        case 'z':
        case 'Z':
        case 'Control':
          rotate(false);
          break;
        case ' ':
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          hold();
          break;
        case '1':
          useItem('bomb');
          break;
        case '2':
          useItem('slow');
          break;
        case '3':
          useItem('morphI');
          break;
        case '4':
          useItem('drill');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotate, softDrop, hardDrop, hold, togglePause, startGame, useItem]);

  // Compute ghost Y position
  const ghostY = currentPiece ? getGhostY(board, currentPiece) : null;

  return {
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
    moveLeft: () => moveHorizontal(-1),
    moveRight: () => moveHorizontal(1),
    rotateCw: () => rotate(true),
    rotateCcw: () => rotate(false),
    softDrop,
    hardDrop,
    hold,
  };
}
