import { TetrominoType } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Base shapes in default orientation (rotation = 0)
export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// Color palettes matching the reference screenshot with beveled highlight/shadow
export interface BlockStyle {
  base: string;
  light: string;
  dark: string;
  border: string;
}

export const BLOCK_COLORS: Record<TetrominoType | 'border' | 'ghost', BlockStyle> = {
  T: {
    base: '#8a07c9',
    light: '#b63eff',
    dark: '#5a0087',
    border: '#3d005c',
  },
  I: {
    base: '#00c3d9',
    light: '#4eedff',
    dark: '#007b8a',
    border: '#00535e',
  },
  O: {
    base: '#d4c700',
    light: '#fff238',
    dark: '#857c00',
    border: '#575100',
  },
  J: {
    base: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    border: '#172554',
  },
  L: {
    base: '#c90094', // vibrant magenta-purple as seen on the right side of screenshot
    light: '#ff42cd',
    dark: '#870064',
    border: '#5c0044',
  },
  S: {
    base: '#16a34a',
    light: '#4ade80',
    dark: '#15803d',
    border: '#14532d',
  },
  Z: {
    base: '#dc2626',
    light: '#f87171',
    dark: '#b91c1c',
    border: '#7f1d1d',
  },
  border: {
    base: '#52525b',
    light: '#71717a',
    dark: '#3f3f46',
    border: '#27272a',
  },
  ghost: {
    base: 'rgba(255, 255, 255, 0.12)',
    light: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.35)',
  },
};

// Line clear score points
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

export const BLOCKS_PER_SPEED_LEVEL = 15;

// Drop interval in milliseconds per level (accelerates significantly every 15 blocks placed)
export const getDropSpeed = (level: number): number => {
  // Level 1 (0~14 blocks): 800ms - 편안한 기본 속도
  // Level 2 (15~29 blocks): 620ms - 체감될 정도로 뚜렷하게 가속 (-180ms)
  // Level 3 (30~44 blocks): 480ms - 확실히 빠른 속도감 (-140ms)
  // Level 4 (45~59 blocks): 360ms - 긴장감 있는 빠른 속도 (-120ms)
  // Level 5 (60~74 blocks): 260ms - 집중력이 필요한 고속 (-100ms)
  // Level 6 (75~89 blocks): 180ms - 손이 매우 바빠지는 속도 (-80ms)
  // Level 7 (90~104 blocks): 120ms - 초고속 모드 (-60ms)
  // Level 8 (105~119 blocks): 80ms - 한계 스피드 (-40ms)
  // Level 9+ (120+ blocks): 50ms - 최고 난도
  const speedTable: Record<number, number> = {
    1: 800,
    2: 620,
    3: 480,
    4: 360,
    5: 260,
    6: 180,
    7: 120,
    8: 80,
  };

  if (level in speedTable) {
    return speedTable[level];
  }

  return Math.max(50, 80 - (level - 8) * 10);
};
