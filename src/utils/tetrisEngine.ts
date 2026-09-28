import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINO_SHAPES } from '../constants/tetris';
import { BoardMatrix, CellValue, TetrominoPiece, TetrominoType } from '../types/tetris';

export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, (): CellValue => null)
  );
}

// 7-Bag Randomizer generator
export function generate7Bag(): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

// Rotate a 2D matrix clockwise or counter-clockwise
export function rotateMatrix(matrix: number[][], clockwise = true): number[][] {
  const N = matrix.length;
  const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (clockwise) {
        result[x][N - 1 - y] = matrix[y][x];
      } else {
        result[N - 1 - x][y] = matrix[y][x];
      }
    }
  }
  return result;
}

// Check collision with walls, bottom floor, or existing blocks
export function checkCollision(
  board: BoardMatrix,
  shape: number[][],
  posX: number,
  posY: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const targetX = posX + c;
        const targetY = posY + r;

        // Check horizontal boundaries
        if (targetX < 0 || targetX >= BOARD_WIDTH) {
          return true;
        }

        // Check bottom boundary
        if (targetY >= BOARD_HEIGHT) {
          return true;
        }

        // Check collision with placed blocks (if targetY >= 0)
        if (targetY >= 0 && board[targetY][targetX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Create a new active piece initialized at top center
export function createPiece(type: TetrominoType): TetrominoPiece {
  const rawShape = TETROMINO_SHAPES[type];
  const shape = rawShape.map((row) => [...row]);
  // Center horizontally
  const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
  const y = type === 'I' ? -1 : 0; // slight offset for I
  return {
    type,
    shape,
    x,
    y,
    rotation: 0,
  };
}

// Compute Ghost piece position (Y coordinate where it would land)
export function getGhostY(board: BoardMatrix, piece: TetrominoPiece): number {
  let ghostY = piece.y;
  while (!checkCollision(board, piece.shape, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Wall kick tests for SRS (offsets [dx, dy])
export function tryRotatePiece(
  board: BoardMatrix,
  piece: TetrominoPiece,
  clockwise = true
): TetrominoPiece | null {
  if (piece.type === 'O') {
    return piece; // O doesn't need rotation
  }

  const rotatedShape = rotateMatrix(piece.shape, clockwise);
  const nextRotation = clockwise ? (piece.rotation + 1) % 4 : (piece.rotation + 3) % 4;

  // Standard wall kick offsets to attempt
  const kickOffsets: [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
    [-2, 0],
    [2, 0],
  ];

  for (const [ox, oy] of kickOffsets) {
    if (!checkCollision(board, rotatedShape, piece.x + ox, piece.y + oy)) {
      return {
        ...piece,
        shape: rotatedShape,
        x: piece.x + ox,
        y: piece.y + oy,
        rotation: nextRotation,
      };
    }
  }

  return null; // Rotation failed (blocked)
}

// Merge locked piece into the board matrix
export function mergePieceToBoard(board: BoardMatrix, piece: TetrominoPiece): BoardMatrix {
  const newBoard = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== 0) {
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = piece.type;
        }
      }
    }
  }
  return newBoard;
}

// Check lines that are full
export function checkFullLines(board: BoardMatrix): number[] {
  const fullLines: number[] = [];
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    if (board[r].every((cell) => cell !== null)) {
      fullLines.push(r);
    }
  }
  return fullLines;
}

// Remove full lines and add new empty rows at the top
export function clearCompletedLines(board: BoardMatrix, fullLines: number[]): BoardMatrix {
  if (fullLines.length === 0) return board;

  const remainingRows = board.filter((_, idx) => !fullLines.includes(idx));
  const newEmptyRows = Array.from({ length: fullLines.length }, () =>
    Array.from({ length: BOARD_WIDTH }, (): CellValue => null)
  );

  return [...newEmptyRows, ...remainingRows];
}
