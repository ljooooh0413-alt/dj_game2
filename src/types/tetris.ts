export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type CellValue = TetrominoType | null;

export type BoardMatrix = CellValue[][];

export interface Position {
  x: number;
  y: number;
}

export interface TetrominoPiece {
  type: TetrominoType;
  shape: number[][]; // 0 or 1
  x: number;
  y: number;
  rotation: number; // 0, 1, 2, 3
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  highScore: number;
  piecesPlaced: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface BlockStyle {
  base: string;
  light: string;
  dark: string;
  border: string;
}

export type SkinPalette = Record<TetrominoType | 'border' | 'ghost', BlockStyle>;

export interface BlockSkin {
  id: string;
  name: string;
  requiredScore: number;
  description: string;
  badge: string;
  tagColor: string;
  palette: SkinPalette;
}

export type ItemType = 'bomb' | 'slow' | 'morphI' | 'drill';

export interface ItemState {
  bomb: number;
  slow: number;
  morphI: number;
  drill: number;
}

