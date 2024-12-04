import { Board, Player, Move } from '../types/game';

const BOARD_SIZE = 10;
const WIN_CONDITION = 5;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

export function checkWinner(board: Board, lastRow: number, lastCol: number): Player | 'Draw' | null {
  // If lastRow and lastCol are -1, it means we're checking the entire board
  if (lastRow === -1 && lastCol === -1) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const result = checkWinnerForCell(board, row, col);
        if (result) return result;
      }
    }
  } else {
    // Check only for the last move
    return checkWinnerForCell(board, lastRow, lastCol);
  }

  // Check for draw
  if (board.every(row => row.every(cell => cell !== null))) return 'Draw';

  return null;
}

function checkWinnerForCell(board: Board, row: number, col: number): Player | null {
  const player = board[row][col];
  if (!player) return null;

  // Check horizontal
  if (checkLine(board, row, col, 0, 1)) return player;

  // Check vertical
  if (checkLine(board, row, col, 1, 0)) return player;

  // Check diagonal (top-left to bottom-right)
  if (checkLine(board, row, col, 1, 1)) return player;

  // Check diagonal (top-right to bottom-left)
  if (checkLine(board, row, col, 1, -1)) return player;

  return null;
}

function checkLine(board: Board, row: number, col: number, dRow: number, dCol: number): boolean {
  const player = board[row][col];
  let count = 1;

  // Check in positive direction
  for (let i = 1; i < WIN_CONDITION; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
    if (board[newRow][newCol] === player) count++;
    else break;
  }

  // Check in negative direction
  for (let i = 1; i < WIN_CONDITION; i++) {
    const newRow = row - i * dRow;
    const newCol = col - i * dCol;
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
    if (board[newRow][newCol] === player) count++;
    else break;
  }

  return count >= WIN_CONDITION;
}

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 'O') score += evaluatePosition(board, row, col, 'O');
      else if (board[row][col] === 'X') score -= evaluatePosition(board, row, col, 'X');
    }
  }
  return score;
}

function evaluatePosition(board: Board, row: number, col: number, player: Player): number {
  let score = 0;
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let empty = 0;
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] === player) count++;
      else if (board[newRow][newCol] === null) empty++;
      else break;
    }
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
      if (board[newRow][newCol] === player) count++;
      else if (board[newRow][newCol] === null) empty++;
      else break;
    }
    score += calculateScore(count, empty);
  }

  return score;
}

function calculateScore(count: number, empty: number): number {
  if (count >= WIN_CONDITION) return 10000;
  if (count === WIN_CONDITION - 1 && empty > 0) return 1000;
  if (count === WIN_CONDITION - 2 && empty > 1) return 100;
  return count;
}

function alphaBeta(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): Move {
  const winner = checkWinner(board, -1, -1);
  if (depth === 0 || winner !== null) {
    return { row: -1, col: -1, score: evaluateBoard(board) };
  }

  let bestMove: Move = { row: -1, col: -1, score: maximizingPlayer ? -Infinity : Infinity };

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        board[row][col] = maximizingPlayer ? 'O' : 'X';
        const { score } = alphaBeta(board, depth - 1, alpha, beta, !maximizingPlayer);
        board[row][col] = null;

        if (maximizingPlayer) {
          if (score > bestMove.score) {
            bestMove = { row, col, score };
          }
          alpha = Math.max(alpha, score);
        } else {
          if (score < bestMove.score) {
            bestMove = { row, col, score };
          }
          beta = Math.min(beta, score);
        }

        if (beta <= alpha) {
          break;
        }
      }
    }
  }

  return bestMove;
}

export function getAIMove(board: Board): Move {
  return alphaBeta(board, 3, -Infinity, Infinity, true);
}

